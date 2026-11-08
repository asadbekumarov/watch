# SwissWatch_premium — E-Commerce Storefront & Admin System

Demonstration e-commerce platform and back-office management system for **SwissWatch_premium** (showrooms in Toshkent and Namangan), featuring luxury Swiss watches from *West End Watch Co.* and *Jacques Philippe*.

---

## 🏛 Architecture Overview

The system is split into two independent Next.js 16 applications sharing a single Supabase backend:

1. **Storefront (Root Application - `D:\projects\watch`)**:
   - Customer-facing catalog, interactive 3D/GSAP hero showcase, multi-currency cart ($ USD and UZS), checkout with branch pickup or city courier delivery, promotional code discounts, and sandbox online payments (Payme & Click).
   - Port: `http://localhost:3000`
   - Static Prerendering with Partial Prerendering (PPR) and timing-safe on-demand cache revalidation.

2. **Admin Panel (`admin/`)**:
   - Dedicated management application for store staff, managers, and the store owner.
   - Port: `http://localhost:3001`
   - Supabase Auth session with Role-Based Access Control (`owner`, `manager`, `staff`), realtime order stream with audio chime, status transition machine, multi-image storage upload, promo code management, delivery method settings, and SMS notification log.

3. **Shared Backend (`Supabase + PostgreSQL`)**:
   - Shared database schema with Row Level Security (RLS), atomic Postgres RPC functions (`create_order_rpc`, `update_order_status_secure`, `validate_promo_code_rpc`, `check_rate_limit`), and database sequences.
   - Shared TypeScript types located in `shared/types/database.types.ts`.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `20.x` or `22.x`+
- npm `10.x`+
- Supabase project (cloud or local Supabase CLI)

### 2. Environment Configuration
Copy `.env.example` to `.env.local` in the project root:
```bash
cp .env.example .env.local
```

Fill in your configuration keys:
```ini
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
REVALIDATION_SECRET=your_secure_random_revalidation_secret

# Supabase (Both apps share this project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Server-only: NEVER expose service_role key to client bundles
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Initial Admin Seeding (Owner account)
INITIAL_ADMIN_EMAIL=watch@gmail.com
INITIAL_ADMIN_PASSWORD=admin123

# Telegram Notifications (Optional, non-blocking)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Sandbox Payments (Phase 4)
PAYME_MERCHANT_ID=test_payme_merchant_id
PAYME_SECRET_KEY=test_payme_secret_key
PAYME_TEST_MODE=true

CLICK_SERVICE_ID=test_click_service_id
CLICK_MERCHANT_ID=test_click_merchant_id
CLICK_SECRET_KEY=test_click_secret_key
CLICK_TEST_MODE=true

# SMS Provider (Phase 5: 'mock' for local, 'eskiz' for gateway)
SMS_PROVIDER=mock
ESKIZ_EMAIL=your_eskiz_email
ESKIZ_PASSWORD=your_eskiz_password
```

For the admin panel, copy `.env.example` into `admin/.env.local`:
```bash
cp .env.example admin/.env.local
```

---

## 🗄 Database Migrations & Seeding

### 1. Apply Database Migrations
Migrations are stored sequentially in `supabase/migrations/`:
- `20261108000001_initial_schema.sql`: Core tables, enums, sequences, constraints, triggers, and `update_order_status_secure`.
- `20261108000002_rls_and_storage.sql`: Row Level Security policies and Supabase Storage bucket configuration.
- `20261108000003_orders_and_realtime.sql`: Concurrency row-locking RPC `create_order_rpc`, DB rate limiter, and Supabase Realtime publication.
- `20261108000004_phase3_delivery_promo.sql`: Canonical delivery methods, promo validation RPC `validate_promo_code_rpc`, and idempotent status updater.

Execute these SQL files in the Supabase SQL Editor or via `supabase db push`.

### 2. Seed Initial Content & Owner Profile
Run the seed script from the root project:
```bash
npx tsx scripts/seed.ts
```
This populates:
- 9 initial Swiss watches with full specifications
- Toshkent and Namangan branches
- Initial FAQ items and hero slides
- Delivery methods (`pickup_tashkent`, `pickup_namangan`, `courier_city`, `regional_delivery`)
- Default store settings (with `usd_to_uzs_rate = NULL` per user rules)
- Seeded owner account (`watch@gmail.com`) with mandatory first-login password change

---

## 💻 Running the Applications

### Storefront (`localhost:3000`)
```bash
npm run dev
```

### Admin Panel (`localhost:3001`)
In a separate terminal:
```bash
npm --prefix admin run dev
```

---

## 🧪 Testing

The repository includes standalone automated test suites covering all architectural layers:

```bash
# 1. Order concurrency, atomic row locking & status transition matrix (Phase 2)
npx tsx scripts/test-order-flow.ts

# 2. Promotional codes, delivery fees, prep time & checkout math (Phase 3)
npx tsx scripts/test-phase3.ts

# 3. Payme JSON-RPC & Click MD5 signatures, tiyin math & idempotency (Phase 4)
npx tsx scripts/test-payments.ts

# 4. Eskiz SMS, mock dispatching, token caching & Telegram resilience (Phase 5)
npx tsx scripts/test-phase5-notifications.ts
```

---

## 💳 Sandbox Payments Testing

### Payme Merchant API (JSON-RPC 2.0)
- Callback endpoint: `POST /api/payments/payme`
- Basic Auth: `Authorization: Basic base64(Paycom:PAYME_SECRET_KEY)`
- Monetary units: **tiyins** (`1 UZS = 100 tiyins`)
- Methods supported: `CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`, `GetStatement`
- Timing-safe authentication comparison prevents side-channel timing attacks.

### Click Shop API
- Callback endpoint: `POST /api/payments/click`
- Formats accepted: `application/x-www-form-urlencoded` and `application/json`
- Methods: Prepare (`action = 0`) and Complete (`action = 1`)
- Constant-time MD5 signature calculation and validation against `CLICK_SECRET_KEY`.

---

## 📲 SMS Notifications (Eskiz.uz & Mock)

- **Mock Provider (`SMS_PROVIDER=mock`)**: Logs dispatched SMS payloads to stdout and writes records to `sms_log`.
- **Eskiz Provider (`SMS_PROVIDER=eskiz`)**: Connects to `https://notify.eskiz.uz/api/`, caches JWT token for 29 days, and auto-refreshes on 401.
- All notifications are non-blocking: network failure never halts customer checkout or admin order advancement.
- Management screen: View history and re-send failed messages at `http://localhost:3001/sms`.

---

## 🛡 SEO & Demo Indexation Guards

Per project safety requirements:
1. `robots.txt` enforces `Disallow: /` for all user agents on both applications.
2. Root and admin `layout.tsx` output `<meta name="robots" content="noindex, nofollow, nocache" />`.
3. `next.config.ts` sends HTTP header `X-Robots-Tag: noindex, nofollow` on every route.
4. No fake production domain is referenced.

---

## 🔄 Cache Revalidation Protocol

When the admin edits products, settings, or branches:
1. Admin server actions call `/api/revalidate` with header `x-revalidate-secret`.
2. The storefront performs timing-safe comparison (`crypto.timingSafeEqual`) on the secret.
3. Next.js cache tags (`products`, `site-settings`, `branches`, `faqs`) and paths are invalidated, serving updated data immediately.
