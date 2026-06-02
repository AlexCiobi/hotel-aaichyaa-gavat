# Thali House Website — Client Handover Guide

## Overview

Your Thali House website consists of:
- **Frontend**: React app (hosted on Vercel/Netlify)
- **Database**: Supabase (PostgreSQL + Auth)
- **Backend**: FastAPI (hosted on Railway/Render) — handles WhatsApp notifications
- **Admin Panel**: `/admin` route (password protected, not linked publicly)

---

## 1. Admin Panel Login

URL: `https://your-domain.com/admin`

Default credentials:
- **Email**: `admin@thalihouse.com`
- **Password**: `ThaliHouse@2024`

> **Change these before going live** — see section 4 below.

---

## 2. Adding Razorpay Keys

When you receive your Razorpay keys from the client:

**Step 1**: Log into your hosting provider (Vercel/Netlify)

**Step 2**: Go to Environment Variables settings

**Step 3**: Add/update:
```
VITE_RAZORPAY_KEY_ID = rzp_live_your_actual_key_here
```

**Step 4**: Redeploy the frontend

The "Pay Online" button will automatically appear in the Order page once a live key is set. With `rzp_test_placeholder`, only Cash on Delivery is shown.

> Get keys from: https://dashboard.razorpay.com → Settings → API Keys

---

## 3. Adding WhatsApp Keys

**Step 1**: Go to https://developers.facebook.com → Create an App → Select "Business" → Add "WhatsApp" product

**Step 2**: In your Meta App:
- Go to WhatsApp → API Setup
- Note your **Phone Number ID** (`WHATSAPP_PHONE_ID`)
- Create a System User and generate a permanent token (`WHATSAPP_TOKEN`)

**Step 3**: Add these to your backend's environment variables (Railway/Render dashboard):
```
WHATSAPP_TOKEN=EAAxxxx...
WHATSAPP_PHONE_ID=123456789
WHATSAPP_VERIFY_TOKEN=thalihouse_webhook_verify_2024
OWNER_WHATSAPP_NUMBER=+918888377788
```

**Step 4**: In Meta App dashboard → WhatsApp → Webhooks:
- Callback URL: `https://your-api-domain.com/webhook/whatsapp`
- Verify Token: same as `WHATSAPP_VERIFY_TOKEN` above

**Step 5**: Restart the backend service

> Until WhatsApp is configured, all notification messages are logged to the backend console — nothing breaks.

---

## 4. Changing the Admin Password

**Option A (Recommended)**: Via environment variables

1. Go to your hosting provider's environment variables
2. Update:
   ```
   VITE_ADMIN_EMAIL=new-admin@thalihouse.com
   VITE_ADMIN_PASSWORD=YourNewStrongPassword!
   ```
3. Redeploy

**Option B**: Edit the `.env.local` file on the server directly (development only)

---

## 5. Managing Menu Items

### Via Admin Panel (recommended)
1. Log into `/admin`
2. Click **Menu** in the sidebar
3. Use the toggle switch to mark items as available/unavailable
4. Click the edit (pencil) icon to change price, name, or description
5. Changes are live immediately — no redeploy needed

### Adding a New Item (database)
1. Go to your Supabase dashboard → Table Editor → `menu_items`
2. Click "Insert row"
3. Fill in all fields:
   - `category`: one of `thali`, `starters`, `main_course`, `breads`, `rice`, `beverages`, `snacks`
   - `name_en`, `name_mr`, `name_hi`, `name_kn`: names in all 4 languages
   - `description_en`, `description_mr`, `description_hi`, `description_kn`: descriptions
   - `price`: amount in INR (integer)
   - `image_url`: path to image in `/images/` folder, or a full URL
   - `is_veg`: true/false
   - `is_available`: true/false

---

## 6. Managing Orders

1. Log into `/admin` → click **Orders**
2. Use the status filter to view: All / Placed / Preparing / Ready / Delivered / Cancelled
3. Use the search box to find orders by customer name or order number
4. Change order status by clicking the dropdown in the Status column
5. Click any row to see full order details (items, customer info, notes)
6. Export to CSV using the **Export CSV** button

### Order Statuses (in order):
`placed` → `confirmed` → `preparing` → `ready` → `delivered`

---

## 7. Managing Reservations

1. Log into `/admin` → click **Reservations**
2. Filter by date and status
3. **Accept** or **Reject** pending reservations using the action buttons
4. Mark as **Completed** when guests have arrived
5. Use **Add Manual** to create reservations for walk-in customers

---

## 8. Accessing the Database Directly

Go to https://supabase.com → Sign In → Select your project

Key tables:
| Table | Contents |
|-------|----------|
| `orders` | All customer orders |
| `reservations` | Table bookings |
| `menu_items` | Menu (edit prices here) |
| `users` | Registered customers |
| `offers` | Promotional offers |
| `restaurant_tables` | Physical tables + status |

---

## 9. Email Notifications (Order Confirmation)

The order confirmation email function is deployed at:
`supabase/functions/send-order-email/`

To activate:
1. Sign up at https://resend.com (free: 100 emails/day)
2. Verify your domain
3. Get your API key
4. In Supabase Dashboard → Edge Functions → Secrets, add:
   - `RESEND_API_KEY` = your Resend API key
   - `FROM_EMAIL` = orders@yourdomain.com

---

## 10. Running the Backend Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your values
uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

---

## 11. Deploying Updates

### Frontend (Vercel)
```bash
git add .
git commit -m "update: description of changes"
git push origin main
```
Vercel auto-deploys on push.

### Backend (Railway)
Push to the `backend` branch, or connect Railway to your GitHub repo with auto-deploy.

---

## Support

For technical issues with this website:

**Developer**: Alex Cioban
**GitHub**: github.com/AlexCiobi/thali-house-website

For Supabase issues: https://supabase.com/support
For Razorpay issues: https://razorpay.com/support
For WhatsApp Business API: https://developers.facebook.com/support
