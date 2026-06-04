"""
Hotel Aaichyaa Gavat Backend — FastAPI
Handles WhatsApp notifications for orders and reservations.
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from whatsapp_service import WhatsAppService

load_dotenv()

app = FastAPI(title="Hotel Aaichyaa Gavat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "https://thalihouse.netlify.app",
        "https://thalihouse.vercel.app",
        "http://localhost:80",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

wa = WhatsAppService()


class OrderItem(BaseModel):
    name: str
    qty: int
    price: int

class OrderNotifyPayload(BaseModel):
    order_number: str
    customer_name: str
    whatsapp_number: str
    order_type: str
    items: List[OrderItem]
    total: int
    table_number: Optional[str] = None
    arrival_date: Optional[str] = None
    arrival_time: Optional[str] = None
    guests: Optional[int] = None

class OrderStatusPayload(BaseModel):
    order_number: str
    whatsapp_number: str
    status: str

class ReservationNotifyPayload(BaseModel):
    booking_ref: str
    customer_name: str
    whatsapp_number: str
    date: str
    time: str
    guests: int
    table_number: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "whatsapp_configured": wa.is_configured()}


@app.post("/notify/order-placed")
async def notify_order_placed(payload: OrderNotifyPayload):
    """Send WhatsApp receipt to customer + alert to owner on new order."""
    items_lines = "\n".join(
        f"  {item.name} x{item.qty} — Rs.{item.price * item.qty}"
        for item in payload.items
    )
    items_summary = ", ".join(f"{item.qty}x {item.name}" for item in payload.items)
    payment_label = "Cash on Delivery"

    preorder_line = ""
    if payload.order_type == "preorder" and payload.arrival_date:
        preorder_line = (
            f"\nArrival: {payload.arrival_date} at {payload.arrival_time}"
            f"\nGuests: {payload.guests}"
        )

    # ── Customer receipt ───────────────────────────────────────────────────────
    customer_msg = (
        f"*Your Hotel Aaichyaa Gavat Order Receipt* 🍛\n\n"
        f"Order #{payload.order_number}\n\n"
        f"*Items:*\n{items_lines}\n\n"
        f"*Total: Rs.{payload.total}*\n"
        f"Payment: {payment_label}\n"
        f"Estimated time: 20-30 min"
        f"{preorder_line}\n\n"
        f"Thank you for ordering from Hotel Aaichyaa Gavat!"
    )

    # ── Owner alert ────────────────────────────────────────────────────────────
    table_line = f"\nTable: T{payload.table_number}" if payload.table_number else ""
    preorder_owner = ""
    if payload.order_type == "preorder" and payload.arrival_date:
        preorder_owner = (
            f"\nArrival: {payload.arrival_date} at {payload.arrival_time}, "
            f"{payload.guests} guests"
        )

    owner_msg = (
        f"*New Order #{payload.order_number}* 🔔\n\n"
        f"Customer: {payload.customer_name} - {payload.whatsapp_number}\n"
        f"Items: {items_summary}\n"
        f"Total: Rs.{payload.total}\n"
        f"Type: {payload.order_type.replace('-', ' ').title()}"
        f"{table_line}"
        f"{preorder_owner}"
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
        "ready": f"*Hotel Aaichyaa Gavat* 🍛\n\nYour order *#{payload.order_number}* is ready! Please collect it.",
        "delivered": f"*Hotel Aaichyaa Gavat* 🍛\n\nYour order *#{payload.order_number}* has been delivered. Enjoy your meal! 😊",
        "cancelled": f"*Hotel Aaichyaa Gavat* 🍛\n\nWe're sorry, your order *#{payload.order_number}* has been cancelled. Please call us at +91 88883 77788.",
    }
    msg = messages.get(payload.status, f"Your order #{payload.order_number} status: {payload.status}")
    result = wa.send_text(payload.whatsapp_number, msg)
    return {"success": True, "result": result}


@app.post("/notify/reservation-confirmed")
async def notify_reservation_confirmed(payload: ReservationNotifyPayload):
    customer_msg = (
        f"*Hotel Aaichyaa Gavat* 🍛\n\n"
        f"Your reservation is confirmed! 🎉\n\n"
        f"Ref: {payload.booking_ref}\n"
        f"Date: {payload.date}\n"
        f"Time: {payload.time}\n"
        f"Guests: {payload.guests}\n"
        f"{f'Table: {payload.table_number}' if payload.table_number else ''}\n\n"
        f"See you soon! To change your reservation call +91 88883 77788."
    )
    owner_msg = (
        f"*NEW RESERVATION* 📅\n\n"
        f"Ref: {payload.booking_ref}\n"
        f"Customer: {payload.customer_name}\n"
        f"Phone: {payload.whatsapp_number}\n"
        f"Date: {payload.date}\n"
        f"Time: {payload.time}\n"
        f"Guests: {payload.guests}"
    )
    results = {}
    results["customer"] = wa.send_text(payload.whatsapp_number, customer_msg)
    owner_number = os.getenv("OWNER_WHATSAPP_NUMBER", "")
    if owner_number:
        results["owner"] = wa.send_text(owner_number, owner_msg)
    return {"success": True, "results": results}


@app.get("/webhook/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    params = dict(request.query_params)
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "thalihouse_verify")
    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == verify_token:
        return int(params.get("hub.challenge", 0))
    raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook/whatsapp")
async def whatsapp_webhook_receive(request: Request):
    body = await request.json()
    print("WhatsApp webhook received:", body)
    return {"status": "ok"}
