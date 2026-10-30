# BHABACHYAKA EXPRESS (ভ্যাবাচ্যাকা এক্সপ্রেস)
### Commercial-Grade Bilingual SaaS Bus Ticketing, Counter POS, Transport ERP & Administration Platform

> **Official Bengali Name:** ভ্যাবাচ্যাকা এক্সপ্রেস  
> **Official English Name:** Bhabachyaka Express  
> **Primary Bengali Tagline:** নিরাপদে পৌঁছে দেবে আপনার গন্তব্যে  
> **Primary English Tagline:** Your Journey, Our Responsibility.  
> **Country & Currency:** Bangladesh | Bangladeshi Taka (BDT / ৳)  
> **Timezone:** Asia/Dhaka | **Languages:** Bengali (বাংলা) & English  

---

## 🚀 Key Highlights & Capabilities

1. **Complete Bilingual Experience:**
   - 100% symmetric Bengali and English coverage across public web, customer accounts, Counter POS, Operator ERP, Boarding Staff, and Super Admin.
   - Dynamic locale routing (`/bn`, `/en`) preserving query parameters (e.g. Origin, Destination, Date).

2. **Official Branding & Locally Stored Assets:**
   - Official Bhabachyaka Express logo with orange sunburst and calligraphy integrated throughout the entire application.
   - Real, locally stored high-resolution photos (Bangladesh expressway hero bus, Scania luxury fleet, Cox's Bazar Marine Drive, Sylhet Tea Estate).
   - Documented in [`docs/IMAGE_ASSET_MANIFEST.md`](docs/IMAGE_ASSET_MANIFEST.md).

3. **Central Booking Engine & Concurrency Locking:**
   - Interactive 2+2 and 2+1 seat layouts with Front/Driver steering wheel orientation and Available/Selected/Booked/Held seat states.
   - 10-minute temporary seat hold locking to prevent double-booking across concurrent browser sessions and counter cashier stations.
   - Server-side price verification and ACID transaction booking execution.

4. **High-Speed Counter POS Subsystem:**
   - Designed for fast touch, mouse, and keyboard operations at bus terminals.
   - Shift opening, closing, cash collection, and cash drawer reconciliation with discrepancy tracking.
   - Instant ticket issuance and printing (80mm thermal receipt, 58mm mini receipt, and A4 travel voucher).

5. **Digital Tickets & QR Verification:**
   - Non-predictable unique 9-char PNR (`BE...`) and encrypted verification tokens.
   - Dynamic SVG QR code generation for paperless contactless boarding.
   - Dedicated Boarding Staff interface with duplicate scan protection.

6. **Transport Fleet ERP & Multi-Tenant SaaS Platform:**
   - Operator ERP: live revenue tracking, fleet registry, route stops, scheduled departures, occupancy analytics.
   - Super Admin SaaS Portal: multi-tenant company onboarding, SaaS subscription tiers (Starter, Growth, Business, Enterprise), and platform GMV.

7. **Customer Portal & Policy Refund Engine:**
   - Customer account with upcoming trips, travel history, and PNR lookup.
   - One-click ticket cancellation enforcing policy charges (10% penalty fee, 90% refund) and instant seat release.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS with official brand tokens (`#0B1F3A`, `#FF6B00`, `#FFB020`, `#16A34A`)
- **Database & ORM:** SQLite with Prisma ORM (`prisma/dev.db`) — zero-config local persistence, 100% compatible with PostgreSQL
- **Security & Auth:** HTTP-only JWT cookies (`jose`), BCrypt password hashing
- **Icons & Utilities:** Lucide React, Zod, QR Code Generator
- **Testing:** Vitest automated test suite

---

## 💻 Quick Start & Running the Project

### 1. Prerequisites
- Node.js v18+ (tested on Node v24.22.1)
- npm

### 2. Setup & Database Initialization
```bash
# Clone or navigate to the project
cd C:\Users\tusha\.gemini\antigravity\scratch\bhabachyaka-express

# Install dependencies
npm install

# Push database schema to SQLite
npx prisma db push

# Seed realistic demonstration data
node scripts/seed.mjs
```

### 3. Run Automated Tests
```bash
npx vitest run
```
*Executes unit and integration tests for currency formatting, Bengali digits, symmetric localization dictionary keys, PNR generation, fare calculation, and cash shift reconciliation.*

### 4. Build for Production
```bash
npm run build
```
*Verifies strict TypeScript types, linting, and Next.js static & dynamic routes.*

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 ৫টি প্রধান ব্যবহারকারী প্যানেল ও ভূমিকা (5 Core User Panels)

| # | ব্যবহারকারীর ভূমিকা (Role) | কারা ও তাদের দায়িত্ব | ড্যাশবোর্ড লিঙ্ক | ডেমো লগইন |
| :-: | :--- | :--- | :--- | :--- |
| **১** | **সুপার অ্যাডমিন (Super Admin / Software Owner)** | সফটওয়্যারটির মূল মালিক/আইটি টিম। পুরো সিস্টেম নিয়ন্ত্রণ, নতুন বাস কোম্পানি অনবোর্ড, সাবস্ক্রিপশন প্ল্যান বরাদ্দ, সিকিউরিটি ও ডেটাবেজ অডিট। | `/[locale]/super-admin` | `superadmin@bhabachyaka.com` / `password123` |
| **২** | **কোম্পানি অ্যাডমিন (Company Admin / Bus Owner)** | নির্দিষ্ট বাস কোম্পানির মালিক/ম্যানেজার। নিজস্ব বাসের রুট, ভাড়ার তালিকা, ট্রিপ শিডিউল, ফ্লিটের বাস সংখ্যা, কর্মচারীদের আইডি তৈরি ও নিয়ন্ত্রণ এবং কোম্পানির দৈনিক আয়-ব্যয়ের হিসাব। | `/[locale]/operator/dashboard` | `owner@bhabachyaka.com` / `password123` |
| **৩** | **কাউন্টার ম্যানেজার / বুকিং এজেন্ট (Counter Agent)** | বাস স্ট্যান্ড বা কাউন্টার কর্মী। যাত্রীদের সরাসরি অফলাইন টিকিট কেটে দেওয়া, সিট বুকিং, টিকিট ক্যান্সেলেশন এবং কাউন্টারের দৈনিক ক্যাশ হিসাব কোম্পানি অ্যাডমিনকে পাঠানো। | `/[locale]/counter/pos` | `counter@bhabachyaka.com` / `password123` |
| **৪** | **বাস ড্রাইভার / সুপারভাইজার (Driver / Supervisor)** | ট্রিপ পরিচালনাকারী অন-বোর্ড ক্রু। কোন ট্রিপে আছেন তা দেখা, যাত্রীদের বোর্ডিং চেক-ইন করা এবং হাইওয়ে ট্রাফিক জ্যাম ও লাইভ লোকেশন আপডেট দেওয়া। | `/[locale]/supervisor` | `boarding@bhabachyaka.com` / `password123` |
| **৫** | **সাধারণ যাত্রী (Customer / Passenger)** | অনলাইনে টিকিট ক্রেতা। আগের টিকিটের ইতিহাস, ই-টিকিট ডাউনলোড, ডিসকাউন্ট অফার দেখা এবং বাতিলকৃত টিকিটের রিফান্ড ট্র্যাকিং। | `/[locale]/account` | `customer@bhabachyaka.com` / `password123` |

> 💡 **পর্যালোচকদের জন্য সুবিধা:** যেকোনো পেজের নিচে ডানদিকের ভাসমান **রোল সুইচার (Role Switcher)** বাটনে ক্লিক করে এক ক্লিকেই এই ৫টি প্যানেলের মধ্যে অদলবদল করা যায়।

---

## 📂 Project Structure

```
bhabachyaka-express/
├── docs/
│   ├── ARCHITECTURE.md          # System architecture & component design
│   ├── DATABASE.md              # Prisma schema & relational models
│   ├── DEPLOYMENT.md            # Local & cloud deployment instructions
│   ├── IMAGE_ASSET_MANIFEST.md  # Detailed manifest of all visual assets
│   ├── PAYMENT_SETUP.md         # Sandbox & live payment gateway setup
│   └── PRODUCTION_CHECKLIST.md  # Verified production readiness checklist
├── messages/
│   ├── bn.json                  # Complete Bengali translation dictionary
│   └── en.json                  # Complete English translation dictionary
├── prisma/
│   ├── dev.db                   # SQLite relational database
│   └── schema.prisma            # Prisma multi-tenant data schema
├── public/
│   ├── brand/                   # Official logo & brand graphics
│   └── images/
│       ├── buses/               # Luxury Scania & Hyundai coach photos
│       ├── destinations/        # Cox's Bazar, Sylhet, Dhaka highway photos
│       ├── hero/                # Golden sunrise Bangladesh highway bus
│       └── promotions/          # Multi-lane expressway promo photos
├── scripts/
│   └── seed.mjs                 # Safe, repeatable database seed script
├── src/
│   ├── app/
│   │   ├── [locale]/            # Dynamic locale-based App Router pages
│   │   │   ├── account/         # Customer account & booking history
│   │   │   ├── boarding/        # Boarding staff QR verification
│   │   │   ├── booking/         # Passenger info, checkout, confirmation
│   │   │   ├── counter/pos/     # Counter POS cashier system
│   │   │   ├── operator/        # Operator fleet & trip ERP
│   │   │   ├── search/          # Bus search results with seat maps
│   │   │   ├── super-admin/     # SaaS platform administration
│   │   │   └── ...              # Auth & legal policy pages
│   │   └── api/                 # REST endpoints for auth, trips, holds, bookings, pos, boarding
│   ├── components/              # Navbar, Footer, SeatMap, TicketPrint, HeroBookingForm, RoleSwitcher
│   └── lib/                     # Prisma singleton, auth, concurrency, ticket QR, i18n
└── tests/
    └── booking.test.ts          # Automated Vitest test suite
```
