from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class UserBase(BaseModel):
    name: str
    age: int

class User(UserBase):
    id: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "patient" # 'patient' or 'clinician'
    name: str
    age: Optional[int] = None
    clinic_id: str = "default_clinic"
    xp: int = 0
    level: int = 1

class UserInDB(UserCreate):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class GameSessionMetrics(BaseModel):
    child_id: str
    reaction_time_ms: float
    omission_errors: int
    commission_errors: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MemorySessionMetrics(BaseModel):
    child_id: str
    max_span: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlexibilitySessionMetrics(BaseModel):
    child_id: str
    accuracy_rate: float
    avg_reaction_time_ms: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SpeedSessionMetrics(BaseModel):
    child_id: str
    completion_time_ms: int
    errors_made: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CognitiveProfile(BaseModel):
    child_id: str
    attention_score: Optional[str] = None
    impulsivity_score: Optional[str] = None
    working_memory_score: Optional[str] = None
    cognitive_flexibility_score: Optional[str] = None
    processing_speed_score: Optional[str] = None
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    recommendations: List[str] = []
