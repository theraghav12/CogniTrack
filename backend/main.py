from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import db
from models import GameSessionMetrics, MemorySessionMetrics, FlexibilitySessionMetrics, SpeedSessionMetrics, CognitiveProfile
from ml_service import analyze_cognitive_metrics, analyze_memory_metrics, analyze_flexibility_metrics, analyze_speed_metrics

app = FastAPI(title="CogniTrack API")

# Setup CORS for frontend to allow localhost connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the CogniTrack Backend API"}

@app.post("/api/metrics", response_model=CognitiveProfile)
async def submit_metrics(metrics: GameSessionMetrics):
    """
    Receives raw gameplay metrics, saves them, runs the AI analysis, and stores the resulting cognitive profile.
    """
    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    # Fetch existing profile if any
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_cognitive_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    return profile

@app.post("/api/metrics/memory", response_model=CognitiveProfile)
async def submit_memory_metrics(metrics: MemorySessionMetrics):
    """
    Receives visuospatial memory span metrics and updates the cognitive profile.
    """
    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    # Fetch existing profile if any
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_memory_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    return profile

@app.post("/api/metrics/flexibility", response_model=CognitiveProfile)
async def submit_flexibility_metrics(metrics: FlexibilitySessionMetrics):
    """
    Receives cognitive flexibility metrics (task switching) and updates the cognitive profile.
    """
    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_flexibility_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    return profile

@app.post("/api/metrics/speed", response_model=CognitiveProfile)
async def submit_speed_metrics(metrics: SpeedSessionMetrics):
    """
    Receives processing speed metrics (trail making) and updates the cognitive profile.
    """
    metrics_dict = metrics.model_dump()
    await db.metrics.insert_one(metrics_dict)
    
    profile_data = await db.profiles.find_one({"child_id": metrics.child_id}, sort=[("generated_at", -1)])
    existing_profile = CognitiveProfile(**profile_data) if profile_data else None
    
    profile = analyze_speed_metrics(metrics, existing_profile)
    
    profile_dict = profile.model_dump()
    await db.profiles.insert_one(profile_dict)
    
    return profile

@app.get("/api/profile/{child_id}", response_model=CognitiveProfile)
async def get_profile(child_id: str):
    """
    Retrieves the most recent cognitive profile for a specific child ID.
    """
    # Find the most recent profile for the child, sorted by generated_at descending
    profile_data = await db.profiles.find_one(
        {"child_id": child_id},
        sort=[("generated_at", -1)]
    )
    
    if not profile_data:
        raise HTTPException(status_code=404, detail="Cognitive profile not found for this child ID")
        
    return CognitiveProfile(**profile_data)

