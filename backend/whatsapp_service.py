"""
WhatsApp Cloud API service for Thali House.
Uses Meta WhatsApp Business Platform (free tier supports 1000 conversations/month).

Setup:
1. Go to https://developers.facebook.com → Create App → WhatsApp
2. Get WHATSAPP_TOKEN (Permanent token from System User)
3. Get WHATSAPP_PHONE_ID (Phone Number ID from WhatsApp settings)
4. Set OWNER_WHATSAPP_NUMBER in .env (owner's number with country code, e.g. +918888377788)

When env vars are missing, messages are logged to console instead of sent.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)


class WhatsAppService:
    BASE_URL = "https://graph.facebook.com/v19.0"

    def __init__(self):
        self.token = os.getenv("WHATSAPP_TOKEN", "")
        self.phone_id = os.getenv("WHATSAPP_PHONE_ID", "")

    def is_configured(self) -> bool:
        return bool(self.token and self.phone_id)

    def send_text(self, to: str, message: str) -> dict:
        """
        Send a WhatsApp text message.
        'to' must be in E.164 format: +919876543210
        Returns {"sent": True} on success or {"sent": False, "reason": "..."} on failure.
        """
        to_clean = to.replace(" ", "").replace("-", "")

        if not self.is_configured():
            logger.info(
                "[WhatsApp MOCK] To: %s\n%s\n%s",
                to_clean, "-" * 40, message
            )
            return {"sent": False, "reason": "WhatsApp not configured — logged to console"}

        url = f"{self.BASE_URL}/{self.phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to_clean.lstrip("+"),
            "type": "text",
            "text": {"body": message, "preview_url": False},
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            logger.info("WhatsApp sent to %s: %s", to_clean, data)
            return {"sent": True, "message_id": data.get("messages", [{}])[0].get("id")}
        except requests.RequestException as exc:
            logger.error("WhatsApp send failed to %s: %s", to_clean, exc)
            return {"sent": False, "reason": str(exc)}
