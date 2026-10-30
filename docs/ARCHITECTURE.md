# SYSTEM ARCHITECTURE
## Bhabachyaka Express (ভ্যাবাচ্যাকা এক্সপ্রেস)
### Cloud-Native SaaS Bus Ticketing, Counter POS & Fleet ERP Platform

---

## 1. High-Level Architecture Overview

Bhabachyaka Express is built as a robust, bilingual, modular full-stack application leveraging Next.js App Router, TypeScript, Tailwind CSS, and Prisma ORM with SQLite (and PostgreSQL compatibility for cloud multi-instance scaling).

```
                      +---------------------------------------+
                      |          Client Applications          |
                      |  - Public Portal (/bn, /en)           |
                      |  - Counter POS (/bn/counter/pos)      |
                      |  - Operator ERP (/bn/operator)        |
                      |  - Super Admin SaaS (/bn/super-admin) |
                      |  - Boarding Staff App (/bn/boarding)  |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST / Server Actions
                                          v
                      +---------------------------------------+
                      |         Next.js App Server Layer      |
                      |  - Authentication & JWT Jose          |
                      |  - Locale Resolver (bn/en)            |
                      |  - Role-Based Authorization           |
                      |  - Concurrency & Seat Locking Engine  |
                      |  - Fare & Commission Calculators      |
                      |  - Thermal/A4 Ticket QR Generator     |
                      +-------------------+-------------------+
                                          |
                                          | Database Connection (Prisma ORM)
                                          v
                      +---------------------------------------+
                      |      Relational Database (dev.db)     |
                      |  - Tenants & SaaS Subscriptions       |
                      |  - Users & Roles (BCrypt)             |
                      |  - Fleets, Buses, Routes & Stops      |
                      |  - Trips & Authoritative Seat Inventory|
                      |  - Bookings, Tickets & Passengers     |
                      |  - Payments, Cash Shifts & Audits     |
                      +---------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Authoritative Booking Engine & Concurrency Locking
- Seat inventory is authoritatively managed on the backend database.
- A 10-minute temporary seat hold prevents double-booking across concurrent browser sessions or counter cashier stations.
- Expired seat holds are automatically released to `AVAILABLE` status.
- Final booking confirmation executes inside a Prisma ACID transaction.

### 2.2 Counter POS Subsystem
- Optimized for desktop and touchscreen terminal operations.
- Shift lifecycle with opening balance, collected cash, authorized expenses, expected closing cash, and cash drawer difference tracking.
- One-click ticket issuance supporting both Cash and MFS (bKash/Nagad).
- Instant printing supporting 80mm thermal receipt, 58mm mini receipt, and A4 travel voucher formats.

### 2.3 QR Verification & Boarding Staff Subsystem
- Every confirmed seat ticket receives a unique cryptographically generated verification code and encrypted QR string.
- Boarding officers can scan or look up PNRs.
- Duplicate boarding scan detection alerts gate staff immediately if a passenger or duplicate voucher was already marked boarded.

### 2.4 Multi-Tenant SaaS Platform
- Bhabachyaka Express serves as the flagship operator while supporting independent transport operators (Green Line, Shohagh, Ena Transport).
- SaaS subscription tiers (Starter, Growth, Business, Enterprise) governing fleet limits, counter limits, and staff counts.
