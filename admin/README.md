# SwissWatch_premium — Admin Management Panel

Dedicated back-office application for **SwissWatch_premium** staff, managers, and store owner.

---

## 🔒 Access Roles & Permissions

- **Owner (`owner`)**: Full administrative rights. Manages staff users, role assignments, store settings (`usd_to_uzs_rate`, default preparation days, contact information), and audit logs.
- **Manager (`manager`)**: Manages watch inventory, multi-image product uploads, prices, stock, promotional codes, delivery methods, branches, FAQs, hero banner slides, and customer orders.
- **Staff (`staff`)**: Dedicated order management. Realtime order queue, order status advancement via secure Postgres RPC (`update_order_status_secure`), internal staff notes, and SMS logs.

---

## 🚀 Running Locally

```bash
# From within the admin/ directory:
npm install
npm run dev
# The admin panel opens at http://localhost:3001
```

### Required Environment Variables (`admin/.env.local`)
```ini
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Server-only (used for initial staff provisioning only):
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REVALIDATION_SECRET=your_secure_random_revalidation_secret
SMS_PROVIDER=mock
```

---

## 📦 Features & Screens

1. **Dashboard (`/`)**: Today's orders, revenue summary, low-stock warnings, orders by branch, and interactive status chart.
2. **Realtime Orders (`/orders`)**: Live order stream powered by Supabase Realtime with audio chime notification, status filtering, branch filtering, internal notes drawer, and estimated ready date editor.
3. **Products (`/products`)**: Inventory list with active/inactive toggle, stock editing, and multi-image storage upload.
4. **Promotional Codes (`/promo`)**: Create and manage percentage and fixed discount codes with minimum order amount, maximum cap, usage limits, and expiration dates.
5. **Delivery Methods (`/delivery`)**: Configure Toshkent/Namangan pickup and courier delivery pricing and free delivery thresholds.
6. **SMS Notifications (`/sms`)**: Searchable log of all dispatched SMS messages with attempt counters, error details, and a 1-click re-send action.
7. **Store Settings (`/settings`)**: Configurable exchange rate (`usd_to_uzs_rate`), default prep days, phone numbers, and showroom working hours.
8. **Staff Management (`/staff`)**: Owner-only screen to invite staff members and assign roles (`manager`, `staff`).
9. **Audit Log (`/audit`)**: Immutable log of every mutation (who, what, when, old values, new values).

