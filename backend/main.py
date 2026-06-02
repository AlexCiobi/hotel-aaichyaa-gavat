"""
Thali House Backend — FastAPI
Handles WhatsApp notifications and other server-side tasks.
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from whatsapp_service import WhatsAppService

load_dotenv()

app = FastAPI(title="Thali House API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "https://thalihouse.netlify.app",
        "https://thalihouse.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

wa = WhatsAppService()


# ─── Models ───────────────────────────────────────────────────────────────────

class OrderNotifyPayload(BaseModel):
    order_number: str
    customer_name: str
    whatsapp_number: str
    order_type: str
    items: list
    total: int
    table_number: Optional[str] = None

class OrderStatusPayload(BaseModel):
    order_number: str
    whatsapp_number: str
    status: str  # ready | delivered | cancelled

class ReservationNotifyPayload(BaseModel):
    booking_ref: str
    customer_name: str
    whatsapp_number: str
    date: str
    time: str
    guests: int
    table_number: Optional[str] = None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "whatsapp_configured": wa.is_configured()}


@app.post("/notify/order-placed")
async def notify_order_placed(payload: OrderNotifyPayload):
    """Send WhatsApp notification to customer + owner on new order."""
    items_text = ", ".join(
        f"{item.get('qty', 1)}x {item.get('name', '')}" for item in payload.items
    )

    # Customer message
    customer_msg = (
        f"*Thali House* 🍛\n\n"
        f"Your order *#{payload.order_number}* has been received!\n\n"
        f"*Items:* {items_text}\n"
        f"*Total:* ₹{payload.total}\n"
        f"*Type:* {payload.order_type.replace('-', ' ').title()}\n"
        f"{f'*Table:* T{payload.table_number}' if payload.table_number else ''}\n\n"
        f"We'll prepare your order right away. Thank you!\n"
        f"📞 +91 88883 77788"
    )

    # Owner message
    owner_msg = (
        f"*NEW ORDER* #{payload.order_number} 🔔\n\n"
        f"*Customer:* {payload.customer_name}\n"
        f"*Phone:* {payload.whatsapp_number}\n"
        f"*Type:* {payload.order_type.replace('-', ' ').title()}\n"
        f"{f'*Table:* T{payload.table_number}' if payload.table_number else ''}\n\n"
        f"*Items:*\n{items_text}\n\n"
        f"*Total: ₹{payload.total}*"
    )

    results = {}
    results["customer"] = wa.send_text(payload.whatsapp_number, customer_msg)
    owner_number = os.getenv("OWNER_WHATSAPP_NUMBER", "")
    if owner_number:
        results["owner"] = wa.send_text(owner_number, owner_msg)

    return {"success": True, "results": results}


@app.post("/notify/order-status")
async def notify_order_status(payload: OrderStatusPayload):
    """Notify customer when order status changes."""
    messages = {
        "ready": f"*Thali House* 🍛\n\nYour order *#{payload.order_number}* is ready! Please collect it.",
        "delivered": f"*Thali House* 🍛\n\nYour order *#{payload.order_number}* has been delivered. Enjoy your meal! 😊",
        "cancelled": f"*Thali House* 🍛\n\nWe're sorry, your order *#{payload.order_number}* has been cancelled. Please call us at +91 88883 77788.",
    }
    msg = messages.get(payload.status, f"Your order #{payload.order_number} status: {payload.status}")
    result = wa.send_text(payload.whatsapp_number, msg)
    return {"success": True, "result": result}


@app.post("/notify/reservation-confirmed")
async def notify_reservation_confirmed(payload: ReservationNotifyPayload):
    """Send WhatsApp confirmation to customer + owner on new reservation."""
    customer_msg = (
        f"*Thali House* 🍛\n\n"
        f"Your reservation is confirmed! 🎉\n\n"
        f"*Ref:* {payload.booking_ref}\n"
        f"*Date:* {payload.date}\n"
        f"*Time:* {payload.time}\n"
        f"*Guests:* {payload.guests}\n"
        f"{f'*Table:* {payload.table_number}' if payload.table_number else ''}\n\n"
        f"See you soon! If you need to change your reservation, call +91 88883 77788."
    )

    owner_msg = (
        f"*NEW RESERVATION* 📅\n\n"
        f"*Ref:* {payload.booking_ref}\n"
        f"*Customer:* {payload.customer_name}\n"
        f"*Phone:* {payload.whatsapp_number}\n"
        f"*Date:* {payload.date}\n"
        f"*Time:* {payload.time}\n"
        f"*Guests:* {payload.guests}"
    )

    results = {}
    results["customer"] = wa.send_text(payload.whatsapp_number, customer_msg)
    owner_number = os.getenv("OWNER_WHATSAPP_NUMBER", "")
    if owner_number:
        results["owner"] = wa.send_text(owner_number, owner_msg)

    return {"success": True, "results": results}


# ─── WhatsApp Webhook (for verification) ──────────────────────────────────────

@app.get("/webhook/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    params = dict(request.query_params)
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "thalihouse_verify")
    if (
        params.get("hub.mode") == "subscribe"
        and params.get("hub.verify_token") == verify_token
    ):
        return int(params.get("hub.challenge", 0))
    raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook/whatsapp")
async def whatsapp_webhook_receive(request: Request):
    """Handle incoming WhatsApp messages (future: auto-reply, order status queries)."""
    body = await request.json()
    print("WhatsApp webhook received:", body)
    return {"status": "ok"}
