# DATABASE ARCHITECTURE & SCHEMA
## Bhabachyaka Express (ভ্যাবাচ্যাকা এক্সপ্রেস)

---

### 1. Database Engine & Persistence

- **Engine:** SQLite with Prisma ORM (`dev.db`) for lightweight, resilient local development and testing; 100% compatible with PostgreSQL in production by switching the provider in `prisma/schema.prisma`.
- **Integrity:** Enforces foreign keys, unique constraints on registration numbers, booking PNRs, ticket numbers, and compound uniqueness for `(tripId, seatNumber)`.
- **Money Handling:** Currency is stored as precise numeric decimals in Bangladeshi Taka (BDT).

---

### 2. Entity Relational Models

```
                                  +-------------------+
                                  |      Tenant       | (Operator / SaaS Company)
                                  +---------+---------+
                                            |
            +-------------------------------+-------------------------------+
            |                               |                               |
            v                               v                               v
    +---------------+               +---------------+               +---------------+
    |     User      |               |      Bus      |               |     Route     |
    +-------+-------+               +-------+-------+               +-------+-------+
            |                               |                               |
            |                               +---------------+---------------+
            |                                               |
            v                                               v
    +---------------+                               +---------------+
    |  StaffAssign  |                               |     Trip      |
    +---------------+                               +-------+-------+
                                                            |
                                            +---------------+---------------+
                                            |                               |
                                            v                               v
                                    +---------------+               +---------------+
                                    |   TripSeat    |               |    Booking    |
                                    +---------------+               +-------+-------+
                                                                            |
                                            +-------------------------------+---------------+
                                            |                               |               |
                                            v                               v               v
                                    +---------------+               +---------------+ +---------------+
                                    |   Passenger   |               |    Ticket     | |    Payment    |
                                    +---------------+               +---------------+ +---------------+
```

---

### 3. Key Table Definitions

- **Tenant:** Multi-tenant transport operator account (name, Bengali name, custom domain, logo, contact phone).
- **SubscriptionPlan & Subscription:** SaaS billing tiers (Starter, Growth, Business, Enterprise) governing bus, route, counter, and staff limits.
- **User:** Role-based users (`SUPER_ADMIN`, `OPERATOR_OWNER`, `TRANSPORT_MANAGER`, `COUNTER_AGENT`, `BOARDING_STAFF`, `CUSTOMER`). Passwords hashed with BCrypt.
- **Bus:** Fleet registry with Bangladesh registration numbers (e.g., ঢাকা মেট্রো-ব ১৪-৮৮৯৯), coach types (Business Class, Royal Sleeper, AC, Non-AC), amenities, and seating layout (2x2, 2x1).
- **Route & RouteStop:** Routes and sequential boarding/dropping stops with duration offsets in minutes.
- **Trip & TripSeat:** Scheduled departures and authoritative seat inventories with real-time status transitions: `AVAILABLE` -> `HELD` -> `BOOKED` -> `BLOCKED`.
- **SeatHold:** Concurrency lock with 10-minute automated expiry.
- **Booking & BookingPassenger:** Confirmed reservation with unique 9-character alphanumeric PNR.
- **Ticket:** Boarding pass containing non-predictable verification code and QR code data string.
- **Payment & Refund:** Multi-channel payment records (Cash, bKash, Nagad, SSLCommerz/Card), transaction references, and refund penalty ledger.
- **CashShift & CashTransaction:** Financial cash reconciliation for counter cashier shifts.
- **AuditLog:** Security audit trail for sensitive administrative, pricing, and ticket cancellation events.
