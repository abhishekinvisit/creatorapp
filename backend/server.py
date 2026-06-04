from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ── Models ──────────────────────────────────────────────────────────────────

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class CreatorOnboardingCreate(BaseModel):
    full_name: str
    gender: str
    age: int
    area: Optional[str] = ""
    city: str
    country: str
    categories: List[str]
    instagram_url: str
    followers_count: int
    years_experience: Optional[int] = 0

class BrandOnboardingCreate(BaseModel):
    brand_name: str
    brand_category: str
    gst_number: str
    brand_bio: Optional[str] = ""
    logo_data: Optional[str] = ""


# ── Routes ───────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "OLLCOLLAB API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in checks:
        if isinstance(c['timestamp'], str):
            c['timestamp'] = datetime.fromisoformat(c['timestamp'])
    return checks

@api_router.post("/onboarding/creator")
async def save_creator_onboarding(data: CreatorOnboardingCreate):
    user_id = str(uuid.uuid4())
    doc = {
        "user_id": user_id,
        "account_type": "creator",
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    return {"success": True, "user_id": user_id}

@api_router.post("/onboarding/brand")
async def save_brand_onboarding(data: BrandOnboardingCreate):
    user_id = str(uuid.uuid4())
    doc = {
        "user_id": user_id,
        "account_type": "brand",
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    return {"success": True, "user_id": user_id}

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        return {"error": "User not found"}
    return doc


# ── App setup ─────────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
