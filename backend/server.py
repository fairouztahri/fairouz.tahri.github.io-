from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: str
    name: str
    language: str = "ar"  # ar or en

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    phone: str
    name: str
    picture: Optional[str] = None
    language: str = "ar"
    role: str = "user"  # user or admin
    created_at: datetime

class SessionCreate(BaseModel):
    session_id: str

class SessionResponse(BaseModel):
    session_token: str
    user: User

class Court(BaseModel):
    model_config = ConfigDict(extra="ignore")
    court_id: str
    name_ar: str
    name_en: str
    type: str  # padel or football
    description_ar: str
    description_en: str
    image_url: Optional[str] = None
    is_active: bool = True

class CourtCreate(BaseModel):
    name_ar: str
    name_en: str
    type: str
    description_ar: str
    description_en: str
    image_url: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: str
    user_id: str
    court_id: str
    date: str  # YYYY-MM-DD
    time_slot: str  # HH:MM format (24-hour)
    duration: int = 60  # minutes
    price: float
    status: str = "pending"  # pending, confirmed, cancelled
    payment_status: str = "pending"  # pending, paid, failed
    created_at: datetime

class BookingCreate(BaseModel):
    court_id: str
    date: str
    time_slot: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    user_id: str
    user_name: str
    court_id: str
    rating: int  # 1-5
    comment: str
    created_at: datetime

class ReviewCreate(BaseModel):
    court_id: str
    rating: int
    comment: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    booking_id: str
    user_id: str
    session_id: str
    amount: float
    currency: str = "aed"
    payment_status: str = "pending"
    created_at: datetime
    updated_at: datetime

class CheckoutRequest(BaseModel):
    booking_id: str
    origin_url: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(user_id: str, email: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expires
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> User:
    # Try cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session_token (from Google OAuth)
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**user_doc)
    
    # Try JWT token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**user_doc)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_price(time_slot: str) -> float:
    """Calculate price based on time slot (morning: 100 AED, evening: 135 AED)"""
    hour = int(time_slot.split(":")[0])
    if 8 <= hour < 16:  # 8 AM to 4 PM
        return 100.0
    else:  # 4 PM to 12 AM
        return 135.0

async def check_slot_availability(court_id: str, date: str, time_slot: str) -> bool:
    """Check if a time slot is available"""
    existing_booking = await db.bookings.find_one({
        "court_id": court_id,
        "date": date,
        "time_slot": time_slot,
        "status": {"$ne": "cancelled"}
    })
    return existing_booking is None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=SessionResponse)
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "phone": user_data.phone,
        "password_hash": hashed_pwd,
        "name": user_data.name,
        "language": user_data.language,
        "role": "user",
        "picture": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    token = create_jwt_token(user_id, user_data.email)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    user_doc.pop("password_hash")
    user_doc.pop("_id")
    
    return SessionResponse(
        session_token=token,
        user=User(**user_doc)
    )

@api_router.post("/auth/login", response_model=SessionResponse)
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_jwt_token(user_doc["user_id"], user_doc["email"])
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    user_doc.pop("password_hash")
    
    return SessionResponse(
        session_token=token,
        user=User(**user_doc)
    )

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/google/callback", response_model=SessionResponse)
async def google_callback(session_data: SessionCreate, response: Response):
    """Handle Google OAuth callback"""
    # Get session data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_data.session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        google_user = auth_response.json()
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": google_user["email"]}, {"_id": 0})
    
    if user_doc:
        # Update user info
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {
                "name": google_user["name"],
                "picture": google_user["picture"]
            }}
        )
        user_id = user_doc["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": google_user["email"],
            "phone": "",  # Can be updated later
            "name": google_user["name"],
            "picture": google_user["picture"],
            "language": "ar",
            "role": "user",
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_token = google_user["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Get updated user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_doc.pop("password_hash", None)
    
    return SessionResponse(
        session_token=session_token,
        user=User(**user_doc)
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== COURTS ROUTES ====================

@api_router.get("/courts", response_model=List[Court])
async def get_courts():
    courts = await db.courts.find({"is_active": True}, {"_id": 0}).to_list(100)
    return courts

@api_router.get("/courts/{court_id}", response_model=Court)
async def get_court(court_id: str):
    court = await db.courts.find_one({"court_id": court_id}, {"_id": 0})
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    return court

@api_router.post("/courts", response_model=Court)
async def create_court(court_data: CourtCreate, request: Request):
    user = await get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    court_id = f"court_{uuid.uuid4().hex[:12]}"
    court_doc = {
        "court_id": court_id,
        **court_data.model_dump(),
        "is_active": True
    }
    
    await db.courts.insert_one(court_doc)
    court_doc.pop("_id")
    return Court(**court_doc)

# ==================== BOOKINGS ROUTES ====================

@api_router.get("/bookings/availability")
async def check_availability(court_id: str, date: str):
    """Get all available time slots for a court on a specific date"""
    # Generate all possible time slots (8 AM to 11 PM, 60-min slots)
    all_slots = []
    for hour in range(8, 24):  # 8 AM to 11 PM (last slot starts at 11 PM)
        time_slot = f"{hour:02d}:00"
        price = calculate_price(time_slot)
        is_available = await check_slot_availability(court_id, date, time_slot)
        all_slots.append({
            "time_slot": time_slot,
            "price": price,
            "is_available": is_available
        })
    
    return {"date": date, "slots": all_slots}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, request: Request):
    user = await get_current_user(request)
    
    # Validate court exists
    court = await db.courts.find_one({"court_id": booking_data.court_id})
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    # Check availability
    is_available = await check_slot_availability(
        booking_data.court_id,
        booking_data.date,
        booking_data.time_slot
    )
    
    if not is_available:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    # Calculate price
    price = calculate_price(booking_data.time_slot)
    
    # Create booking
    booking_id = f"booking_{uuid.uuid4().hex[:12]}"
    booking_doc = {
        "booking_id": booking_id,
        "user_id": user.user_id,
        "court_id": booking_data.court_id,
        "date": booking_data.date,
        "time_slot": booking_data.time_slot,
        "duration": 60,
        "price": price,
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.bookings.insert_one(booking_doc)
    booking_doc.pop("_id")
    return Booking(**booking_doc)

@api_router.get("/bookings/my", response_model=List[Booking])
async def get_my_bookings(request: Request):
    user = await get_current_user(request)
    bookings = await db.bookings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, request: Request):
    user = await get_current_user(request)
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != user.user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return booking

@api_router.patch("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, request: Request):
    user = await get_current_user(request)
    booking = await db.bookings.find_one({"booking_id": booking_id})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != user.user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    
    return {"message": "Booking cancelled successfully"}

# ==================== PAYMENT ROUTES ====================

@api_router.post("/payments/checkout")
async def create_checkout(checkout_data: CheckoutRequest, request: Request):
    user = await get_current_user(request)
    
    # Get booking
    booking = await db.bookings.find_one({"booking_id": checkout_data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if booking["payment_status"] == "paid":
        raise HTTPException(status_code=400, detail="Booking already paid")
    
    # Initialize Stripe
    host_url = checkout_data.origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/bookings"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(booking["price"]),
        currency="aed",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "booking_id": checkout_data.booking_id,
            "user_id": user.user_id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    transaction_doc = {
        "transaction_id": transaction_id,
        "booking_id": checkout_data.booking_id,
        "user_id": user.user_id,
        "session_id": session.session_id,
        "amount": float(booking["price"]),
        "currency": "aed",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    user = await get_current_user(request)
    
    # Get transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check with Stripe
    webhook_url = f"{request.base_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction and booking if paid
        if checkout_status.payment_status == "paid" and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            await db.bookings.update_one(
                {"booking_id": transaction["booking_id"]},
                {"$set": {
                    "payment_status": "paid",
                    "status": "confirmed"
                }}
            )
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount_total": checkout_status.amount_total,
            "currency": checkout_status.currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    webhook_url = f"{request.base_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction and booking
        if webhook_response.payment_status == "paid":
            booking_id = webhook_response.metadata.get("booking_id")
            
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            await db.bookings.update_one(
                {"booking_id": booking_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "confirmed"
                }}
            )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== REVIEWS ROUTES ====================

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, request: Request):
    user = await get_current_user(request)
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if user has completed booking for this court
    booking = await db.bookings.find_one({
        "user_id": user.user_id,
        "court_id": review_data.court_id,
        "status": "confirmed",
        "payment_status": "paid"
    })
    
    if not booking:
        raise HTTPException(status_code=400, detail="You can only review courts you have booked")
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "court_id": review_data.court_id,
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.reviews.insert_one(review_doc)
    review_doc.pop("_id")
    return Review(**review_doc)

@api_router.get("/reviews/{court_id}", response_model=List[Review])
async def get_court_reviews(court_id: str):
    reviews = await db.reviews.find(
        {"court_id": court_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return reviews

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/bookings", response_model=List[Booking])
async def get_all_bookings(request: Request, status: Optional[str] = None):
    user = await get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(request: Request):
    user = await get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    user = await get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_bookings = await db.bookings.count_documents({})
    total_users = await db.users.count_documents({})
    total_revenue = await db.bookings.aggregate([
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]).to_list(1)
    
    revenue = total_revenue[0]["total"] if total_revenue else 0
    
    return {
        "total_bookings": total_bookings,
        "total_users": total_users,
        "total_revenue": revenue
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def startup_db():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.courts.create_index("court_id", unique=True)
    await db.bookings.create_index("booking_id", unique=True)
    await db.bookings.create_index([("court_id", 1), ("date", 1), ("time_slot", 1)])
    await db.reviews.create_index("review_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.payment_transactions.create_index("transaction_id", unique=True)
    await db.payment_transactions.create_index("session_id", unique=True)
    
    # Initialize courts if not exist
    court_count = await db.courts.count_documents({})
    if court_count == 0:
        courts_data = [
            {
                "court_id": "court_padel_001",
                "name_ar": "ملعب البادل",
                "name_en": "Padel Court",
                "type": "padel",
                "description_ar": "ملعب بادل احترافي مع إضاءة ممتازة وأرضية عالية الجودة",
                "description_en": "Professional padel court with excellent lighting and high-quality flooring",
                "image_url": "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
                "is_active": True
            },
            {
                "court_id": "court_football_001",
                "name_ar": "ملعب كرة القدم",
                "name_en": "Football Court",
                "type": "football",
                "description_ar": "ملعب كرة قدم بمعايير احترافية مع عشب صناعي عالي الجودة",
                "description_en": "Professional football court with high-quality artificial turf",
                "image_url": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
                "is_active": True
            }
        ]
        await db.courts.insert_many(courts_data)
        logger.info("Courts initialized")