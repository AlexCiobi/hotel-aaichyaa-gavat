/**
 * Supabase Edge Function: send-welcome-email
 *
 * Sends a branded welcome email to new customers when they register.
 * Uses Resend (https://resend.com — free tier: 100 emails/day).
 *
 * Setup:
 * In Supabase Dashboard → Edge Functions → Secrets, add:
 *   RESEND_API_KEY = re_xxxxxxxxxxxx
 *   FROM_EMAIL     = orders@yourdomain.com (must be verified in Resend)
 *
 * Deploy: supabase functions deploy send-welcome-email
 *
 * Call from frontend after successful signup:
 *   supabase.functions.invoke('send-welcome-email', {
 *     body: { customer_email, customer_name, whatsapp_number }
 *   })
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "orders@thalihouse.in";

interface WelcomeEmailPayload {
  customer_email: string;
  customer_name: string;
  whatsapp_number?: string;
}

function buildEmailHtml(p: WelcomeEmailPayload): string {
  const firstName = p.customer_name.split(" ")[0];

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C0272D 0%,#9e1f25 100%);padding:40px 32px;text-align:center">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;font-size:26px;margin-bottom:14px">🍛</div>
            <h1 style="margin:0;color:#fff;font-size:28px;font-family:Georgia,serif;font-weight:bold">Hotel Aaichyaa Gavat</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Ichalkaranji, Maharashtra</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px">

            <!-- Welcome heading -->
            <h2 style="margin:0 0 8px;color:#1A1A1A;font-size:24px;font-family:Georgia,serif">
              Welcome, ${firstName}! 🎉
            </h2>
            <p style="margin:0 0 28px;color:#666;font-size:15px;line-height:1.6">
              Your Hotel Aaichyaa Gavat account is ready. We're delighted to have you with us —
              authentic Kolhapuri flavours, just a few taps away.
            </p>

            <!-- Divider -->
            <div style="height:1px;background:#f5f0e8;margin-bottom:28px"></div>

            <!-- Account summary -->
            <p style="margin:0 0 14px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Your Account</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f5f0e8;border-radius:10px;overflow:hidden;margin-bottom:28px">
              <tr style="background:#f9f5f0">
                <td style="padding:12px 16px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;width:40%">Name</td>
                <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#1A1A1A">${p.customer_name}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #f5f0e8">Email</td>
                <td style="padding:12px 16px;font-size:14px;color:#1A1A1A;border-top:1px solid #f5f0e8">${p.customer_email}</td>
              </tr>
              ${p.whatsapp_number ? `
              <tr style="background:#f9f5f0">
                <td style="padding:12px 16px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #f5f0e8">WhatsApp</td>
                <td style="padding:12px 16px;font-size:14px;color:#1A1A1A;border-top:1px solid #f5f0e8">${p.whatsapp_number}</td>
              </tr>` : ""}
            </table>

            <!-- What you can do -->
            <p style="margin:0 0 14px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">What you can do</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
              ${[
                ["🍽️", "Order food", "Browse our menu and place orders for dine-in or takeaway"],
                ["📅", "Reserve a table", "Book your table in advance for a guaranteed spot"],
                ["🎁", "Earn loyalty points", "Every order earns points redeemable for discounts"],
              ].map(([icon, title, desc]) => `
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:36px;font-size:20px">${icon}</td>
                <td style="padding:10px 0 10px 8px;vertical-align:top">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1A1A1A">${title}</p>
                  <p style="margin:0;font-size:13px;color:#666">${desc}</p>
                </td>
              </tr>`).join("")}
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:8px">
              <a href="https://thalihouse.in/menu"
                style="display:inline-block;background:#C0272D;color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.3px">
                Explore the Menu
              </a>
            </div>

            <p style="margin:20px 0 0;font-size:13px;color:#999;text-align:center;line-height:1.5">
              Questions? Chat with us on
              <a href="https://wa.me/918888377788" style="color:#25D366;font-weight:600;text-decoration:none">WhatsApp</a>
              or call <strong style="color:#1A1A1A">+91 88883 77788</strong>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A1A1A;padding:24px;text-align:center">
            <p style="margin:0 0 6px;color:#fff;font-size:13px;font-family:Georgia,serif">Hotel Aaichyaa Gavat</p>
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
    const payload: WelcomeEmailPayload = await req.json();

    if (!payload.customer_email || !payload.customer_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.log("[send-welcome-email] RESEND_API_KEY not set — email not sent for", payload.customer_email);
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
        from: `Hotel Aaichyaa Gavat <${FROM_EMAIL}>`,
        to: [payload.customer_email],
        subject: `Welcome to Hotel Aaichyaa Gavat, ${payload.customer_name.split(" ")[0]}! 🍛`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[send-welcome-email] Resend error:", data);
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
    console.error("[send-welcome-email] Error:", err);
    return new Response(JSON.stringify({ sent: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
