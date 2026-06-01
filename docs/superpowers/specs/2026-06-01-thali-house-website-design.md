# Thali House Website — Design Spec
Date: 2026-06-01

## Overview
Premium restaurant website for Thali House, Ichalkaranji, Maharashtra. Authentic Maharashtrian feel with modern premium presentation. Mobile-first, multilingual (MR/HI/EN/KN), animated.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- Backend: FastAPI (Python 3.11)
- Database: Supabase (PostgreSQL)
- Hosting: Vercel (frontend) + Railway (backend)

## Color Palette
- Primary: #FF6B00 (deep saffron)
- Secondary: #8B1A1A (maroon)
- Accent: #D4A017 (turmeric gold)
- Background light: #FDF6EC (warm cream)
- Background dark: #1A1A1A (charcoal)
- Text dark: #2C1810 (deep brown)
- Text light: #F5F0E8 (off-white)

## Typography
- Headings: Playfair Display
- Body: Inter
- Devanagari: Noto Sans Devanagari
- Kannada: Noto Sans Kannada
- Prices/numbers: DM Serif Display

## Pages
1. Home — hero (parallax, cycling tagline), signature dishes, story, menu preview, reviews, offers banner, location, footer
2. Menu — language switcher, category tabs, veg/non-veg filter, glassmorphism cards, 25+ items
3. Order — 3-step flow (select items → details → review/pay), table grid, COD option
4. Reservation — premium form, date/time picker, guest count, occasion selector, visual table map
5. Offers — animated offer cards, countdown timers, loyalty teaser, WhatsApp share
6. Contact — Google Maps embed, click-to-call, contact form, animated hours

## Animations
- Framer Motion: page transitions, scroll reveal, stagger children
- Hero parallax (CSS transform on scroll)
- Language tagline cycling (fade + slide)
- Rotating mandala SVG (hero background)
- Floating spice particles (hero)
- Nav blur on scroll
- Counter animation (story stats)
- WhatsApp button: spin entrance + pulse ring
- Card hover: lift + scale + spring physics
- Menu tab: fill animation

## Database Schema
- menu_items: id, category, price, is_veg, is_available, image_url, name_mr/hi/en/kn, description_mr/hi/en/kn
- tables: id, table_number (T1-T20), capacity, zone, status
- reservations: id, customer_name, customer_phone, table_id, date, time, guests, occasion, status, created_at
- orders: id, customer_name, customer_phone, order_type, table_id, items (jsonb), subtotal, total, payment_status, order_status, special_instructions, created_at
- offers: id, title_mr/hi/en/kn, description_mr/hi/en/kn, discount_percent, valid_until, is_active, image_url

## Architecture
- LanguageContext: global language state, useLanguage() hook
- translations.ts: all UI strings in all 4 languages
- menuData.ts: seeded menu items with all language variants
- Supabase client: orders + reservations persisted; menu read from seeded data
