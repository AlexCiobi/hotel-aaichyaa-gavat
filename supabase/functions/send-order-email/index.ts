/**
 * Supabase Edge Function: send-order-email
 *
 * Triggered after an order is placed. Sends a branded confirmation email
 * to the customer using Resend (https://resend.com — free tier: 100 emails/day).
 *
 * Setup:
 * 1. Sign up at resend.com → get API key
 * 2. In Supabase dashboard → Edge Functions → Secrets:
 *    RESEND_API_KEY = re_xxxxxxxxxxxx
 *    FROM_EMAIL = orders@yourdomain.com (must be verified in Resend)
 *
 * Deploy: supabase functions deploy send-order-email
 *
 * Call from frontend after order insert:
 *   supabase.functions.invoke('send-order-email', { body: { order_id, customer_email, ... } })
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "orders@thalihouse.in";

interface OrderEmailPayload {
  customer_email: string;
  customer_name: string;
  order_number: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  order_type: string;
  table_number?: string;
}

function buildEmailHtml(p: OrderEmailPayload): string {
  const itemRows = p.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f5f0e8;font-size:14px;color:#1A1A1A">${item.qty}× ${item.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f5f0e8;font-size:14px;color:#1A1A1A;text-align:right">₹${item.price * item.qty}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6B00 0%,#e05500 100%);padding:32px;text-align:center">
            <div style="display:inline-block;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:48px;font-size:22px;margin-bottom:12px">🍛</div>
            <h1 style="margin:0;color:#fff;font-size:26px;font-family:Georgia,serif;font-weight:bold">Thali House</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Ichalkaranji, Maharashtra</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-family:Georgia,serif">Order Confirmed!</h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px">Hi ${p.customer_name}, your order has been received.</p>

            <!-- Order number badge -->
            <div style="background:#fff8f2;border:2px solid #FF6B00;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
              <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Order Number</p>
              <p style="margin:0;font-size:28px;font-family:Georgia,serif;color:#FF6B00;font-weight:bold">${p.order_number}</p>
            </div>

            <!-- Order details -->
            <p style="margin:0 0 12px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Order Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f5f0e8;border-radius:8px;overflow:hidden;margin-bottom:24px">
              ${itemRows}
              <tr style="background:#f9f5f0">
                <td style="padding:12px 16px;font-weight:700;font-size:15px;color:#1A1A1A">Total</td>
                <td style="padding:12px 16px;font-weight:700;font-size:18px;color:#FF6B00;text-align:right">₹${p.subtotal}</td>
              </tr>
            </table>

            <!-- Info row -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
              <tr>
                <td width="50%" style="padding:12px;background:#f9f5f0;border-radius:8px;margin-right:8px">
                  <p style="margin:0 0 2px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px">Type</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#1A1A1A;text-transform:capitalize">${p.order_type.replace("-", " ")}</p>
                </td>
                ${p.table_number ? `
                <td width="8px"></td>
                <td width="50%" style="padding:12px;background:#f9f5f0;border-radius:8px">
                  <p style="margin:0 0 2px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px">Table</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#1A1A1A">T${p.table_number}</p>
                </td>` : ""}
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6">
              Your order will be ready in <strong>10-15 minutes</strong>.
              We'll also send a WhatsApp confirmation shortly.
            </p>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:8px">
              <a href="https://wa.me/918888377788" style="display:inline-block;background:#25D366;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none">
                Chat with us on WhatsApp
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A1A1A;padding:24px;text-align:center">
            <p style="margin:0 0 6px;color:#fff;font-size:13px;font-family:Georgia,serif">Thali House</p>
            <p style="margin:0 0 6px;color:#999;font-size:12px">Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji 416115</p>
            <p style="margin:0;color:#999;font-size:12px">+91 88883 77788</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload: OrderEmailPayload = await req.json();

    if (!payload.customer_email || !payload.order_number) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.log("[send-order-email] RESEND_API_KEY not set — email not sent for order", payload.order_number);
      return new Response(JSON.stringify({ sent: false, reason: "RESEND_API_KEY not configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(payload);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Thali House <${FROM_EMAIL}>`,
        to: [payload.customer_email],
        subject: `Order Confirmed — ${payload.order_number} 🍛`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[send-order-email] Resend error:", data);
      return new Response(JSON.stringify({ sent: false, error: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-order-email] Error:", err);
    return new Response(JSON.stringify({ sent: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
