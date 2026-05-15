import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.cognitrack

SCORE_WEIGHTS = {
    "High": 3,
    "Normal": 2,
    "Needs Attention": 1
}

async def scan_for_regressions():
    print(f"[{datetime.now().isoformat()}] Starting Automated Clinical Regression Scan...")
    
    # 1. Fetch all patients
    patients = await db.users.find({"role": "patient"}).to_list(length=None)
    
    alerts_generated = 0
    
    for patient in patients:
        child_id = patient["username"]
        clinic_id = patient.get("clinic_id", "default_clinic")
        
        # 2. Fetch their last 2 cognitive profiles, sorted by generated_at descending
        profiles = await db.cognitive_profiles.find({"child_id": child_id}).sort("generated_at", -1).limit(2).to_list(length=2)
        
        if len(profiles) < 2:
            continue # Not enough data to compare
            
        latest_profile = profiles[0]
        previous_profile = profiles[1]
        
        metrics_to_check = [
            "attention_score", 
            "impulsivity_score", 
            "working_memory_score", 
            "cognitive_flexibility_score", 
            "processing_speed_score"
        ]
        
        for metric in metrics_to_check:
            new_score = latest_profile.get(metric)
            old_score = previous_profile.get(metric)
            
            if new_score and old_score:
                # Calculate numeric drop
                new_val = SCORE_WEIGHTS.get(new_score, 2)
                old_val = SCORE_WEIGHTS.get(old_score, 2)
                
                # If they dropped to "Needs Attention" from something higher
                if new_val == 1 and old_val > 1:
                    print(f"⚠️ REGRESSION DETECTED: {child_id} - {metric} dropped from {old_score} to {new_score}")
                    
                    # 3. Create Alert
                    alert = {
                        "patient_username": child_id,
                        "clinic_id": clinic_id,
                        "metric_name": metric.replace("_score", "").replace("_", " ").title(),
                        "previous_score": old_score,
                        "new_score": new_score,
                        "timestamp": datetime.now(timezone.utc),
                        "is_read": False
                    }
                    
                    # Check if this exact alert was already generated recently to prevent spam
                    existing = await db.alerts.find_one({
                        "patient_username": child_id, 
                        "metric_name": alert["metric_name"],
                        "new_score": new_score,
                        "is_read": False
                    })
                    
                    if not existing:
                        await db.alerts.insert_one(alert)
                        alerts_generated += 1

    print(f"[{datetime.now().isoformat()}] Scan Complete. Generated {alerts_generated} new alerts.")

if __name__ == "__main__":
    asyncio.run(scan_for_regressions())
