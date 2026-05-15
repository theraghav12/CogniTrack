from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-for-development") # TODO: Remove fallback in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

from database import db
from models import GameSessionMetrics, MemorySessionMetrics, FlexibilitySessionMetrics, SpeedSessionMetrics, CognitiveProfile, UserCreate, UserInDB, Token
from bson import ObjectId
from ml_service import analyze_cognitive_metrics, analyze_memory_metrics, analyze_flexibility_metrics, analyze_speed_metrics
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, status, Response

app = FastAPI(title="CogniTrack API")

# Setup CORS for frontend to allow localhost connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the CogniTrack Backend API"}

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register")
async def register(user: UserCreate, response: Response):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(**user.model_dump(), hashed_password=hashed_password)
    await db.users.insert_one(user_in_db.model_dump())
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    return {"message": "Registration successful"}

@app.post("/api/auth/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user
    user = await db.users.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    return {"message": "Login successful"}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"], 
        "role": current_user["role"],
        "name": current_user.get("name"),
        "xp": current_user.get("xp", 0),
        "level": current_user.get("level", 1),
        "clinic_id": current_user.get("clinic_id", "default_clinic")
    }

@app.get("/api/patients")
async def get_patients(current_user: dict = Depends(get_current_user)):
    """
    Returns all patients that belong to the clinician's clinic.
    """
    if current_user.get("role") != "clinician":
        raise HTTPException(status_code=403, detail="Not authorized")
    # Fetch patients belonging to this clinician's clinic
    clinic_id = current_user.get("clinic_id", "default_clinic")
    cursor = db.users.find({"role": "patient", "clinic_id": clinic_id}, {"hashed_password": 0, "_id": 0})
    patients = await cursor.to_list(length=100)
    return patients

@app.post("/api/patients")
async def create_patient(user: UserCreate, current_user: dict = Depends(get_current_user)):
    """
    Allows a clinician to directly register a new patient under their clinic.
    """
    if current_user.get("role") != "clinician":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    # Force patient role and inherit clinician's clinic_id
    user.role = "patient"
    user.clinic_id = current_user.get("clinic_id", "default_clinic")
    
    user_in_db = UserInDB(**user.model_dump(), hashed_password=hashed_password)
    await db.users.insert_one(user_in_db.model_dump())
    
    return {"message": "Patient registered successfully"}

# --- GAMIFICATION ENGINE ---
async def award_xp(username: str, amount: int = 50):
    user = await db.users.find_one({"username": username})
    if user and user.get("role") == "patient":
        new_xp = user.get("xp", 0) + amount
        new_level = (new_xp // 1000) + 1 # 1 Level per 1000 XP
        await db.users.update_one(
            {"username": username},
            {"$set": {"xp": new_xp, "level": new_level}}
        )

# --- CLINICAL ALERTS ENDPOINTS ---

@app.get("/api/alerts")
async def get_alerts(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "clinician":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    clinic_id = current_user.get("clinic_id", "default_clinic")
    # Fetch unread alerts for this clinic
    cursor = db.alerts.find({"clinic_id": clinic_id, "is_read": False}).sort("timestamp", -1)
    alerts = await cursor.to_list(length=50)
    
    # MongoDB ObjectIds are not JSON serializable by default in FastAPI unless converted to strings
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        
    return alerts

@app.put("/api/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "clinician":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found or already read")
    return {"message": "Alert marked as read"}

# --- METRICS & PROFILE ENDPOINTS ---

@app.post("/api/metrics", response_model=CognitiveProfile)
async def submit_metrics(metrics: GameSessionMetrics, current_user: dict = Depends(get_current_user)):
    """
    Receives raw gameplay metrics, saves them, runs the AI analysis, and stores the resulting cognitive profile.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != metrics.child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    # Fetch existing profile if any
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_cognitive_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    # Award XP for playing the game
    await award_xp(metrics.child_id, amount=150)
    
    return profile

@app.post("/api/metrics/memory", response_model=CognitiveProfile)
async def submit_memory_metrics(metrics: MemorySessionMetrics, current_user: dict = Depends(get_current_user)):
    """
    Receives visuospatial memory span metrics and updates the cognitive profile.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != metrics.child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    # Fetch existing profile if any
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_memory_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    # Award XP
    await award_xp(metrics.child_id, amount=100)
    
    return profile

@app.post("/api/metrics/flexibility", response_model=CognitiveProfile)
async def submit_flexibility_metrics(metrics: FlexibilitySessionMetrics, current_user: dict = Depends(get_current_user)):
    """
    Receives rule-switching metrics and updates the cognitive profile.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != metrics.child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_flexibility_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    # Award XP
    await award_xp(metrics.child_id, amount=100)
    
    return profile

@app.post("/api/metrics/speed", response_model=CognitiveProfile)
async def submit_speed_metrics(metrics: SpeedSessionMetrics, current_user: dict = Depends(get_current_user)):
    """
    Receives trail-making speed metrics and updates the cognitive profile.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != metrics.child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_speed_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    # Award XP
    await award_xp(metrics.child_id, amount=100)
    
    return profile

@app.get("/api/metrics/{child_id}/history")
async def get_game_sessions(child_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves the raw game session metrics for a specific child ID.
    Sorted chronologically (newest to oldest) for the history log table.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    cursor = db.metrics.find({"child_id": child_id}, {"_id": 0}).sort("timestamp", -1)
    sessions = await cursor.to_list(length=200)
    return sessions

@app.get("/api/profile/{child_id}", response_model=CognitiveProfile)
async def get_profile(child_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves the most recent cognitive profile for a specific child ID.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    # Find the most recent profile for the child, sorted by generated_at descending
    profile_data = await db.profiles.find_one(
        {"child_id": child_id},
        sort=[("generated_at", -1)]
    )
    
    if not profile_data:
        raise HTTPException(status_code=404, detail="Cognitive profile not found for this child ID")
        
    return CognitiveProfile(**profile_data)

@app.get("/api/profile/{child_id}/history", response_model=list[CognitiveProfile])
async def get_profile_history(child_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves the entire historical progression of cognitive profiles for a specific child ID.
    Sorted chronologically (oldest to newest) for line charts.
    """
    if current_user.get("role") != "clinician" and current_user.get("username") != child_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    cursor = db.profiles.find({"child_id": child_id}).sort("generated_at", 1)
    profiles = await cursor.to_list(length=100)
    
    if not profiles:
        return []
    
    return profiles

