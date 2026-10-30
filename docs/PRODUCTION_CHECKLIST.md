# PRODUCTION READINESS CHECKLIST
## Bhabachyaka Express (ভ্যাবাচ্যাকা এক্সপ্রেস)

---

### 1. Branding & Visual Assets
- [x] Official Bhabachyaka Express logo rendered in desktop, mobile, header, POS, ticket, and auth screens.
- [x] Dual-language brand identity: ভ্যাবাচ্যাকা এক্সপ্রেস (BN) and BHABACHYAKA EXPRESS (EN).
- [x] High-resolution photorealistic Bangladesh highway hero bus image locally stored and optimized (`/images/hero/hero-bus.jpg`).
- [x] Real fleet coach photographs generated and integrated (`/images/buses/luxury-fleet.jpg`).
- [x] Scenic Bangladesh route photography integrated (Cox's Bazar, Sylhet Tea Estate, Dhaka Expressway).
- [x] Complete Asset Manifest compiled in `docs/IMAGE_ASSET_MANIFEST.md`.

---

### 2. Complete Bilingual Support
- [x] Symmetrical dictionary localization with 100% key parity in `messages/bn.json` and `messages/en.json`.
- [x] Locale-prefix routing (`/bn` and `/en`) with persistent query params preservation across language switches.
- [x] Bangladeshi Taka (BDT / ৳) and Bengali digit converters.
- [x] Asia/Dhaka timezone formatting for departures, arrivals, and audit logs.

---

### 3. Core Functional Modules
- [x] Real-time Trip Search with route autocomplete, date pickers, AC/Non-AC filters, time slot filters, and sorting.
- [x] Authoritative interactive 2+2 and 2+1 seat layouts with Front/Driver steering wheel orientation and Available/Selected/Booked/Held seat states.
- [x] Temporary seat holds (10-minute automated expiry) preventing double-booking across concurrent users.
- [x] Passenger details validation, boarding & dropping point selectors.
- [x] Server-side price calculation preventing client-side total tampering.
- [x] Digital ticket generation with unique 9-char PNR (`BE...`) and non-predictable verification token.
- [x] QR code generation and instant thermal ticket printing (80mm, 58mm, A4 voucher formats).
- [x] Full-featured Counter POS system with shift opening, closing, cash drawer reconciliation, and quick sales.
- [x] Boarding Staff interface with QR scanner simulation, PNR search, duplicate boarding alert, and check-in confirmation.
- [x] Operator ERP Dashboard with real metrics (gross revenue, bookings, bus occupancy, active buses).
- [x] Super Admin SaaS Portal with multi-tenant operators, subscription tiers, and system health status.
- [x] Customer Account Portal with booking history, PNR lookup, cancellation request, and 90% policy refund calculation.

---

### 4. Technical Quality & Testing
- [x] Strict TypeScript compilation passing with zero errors.
- [x] Next.js 14 App Router production build (`npm run build`) succeeding with zero warnings or errors.
- [x] Automated test suite (`npx vitest run`) executed with 8 passing test cases.
- [x] Development database seeded with comprehensive realistic demonstration data (`node scripts/seed.mjs`).
