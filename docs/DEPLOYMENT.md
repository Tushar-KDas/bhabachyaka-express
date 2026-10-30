# DEPLOYMENT & OPERATION GUIDE
## Bhabachyaka Express (ভ্যাবাচ্যাকা এক্সপ্রেস)

---

## 1. Local Development Quickstart

### Prerequisites
- Node.js v18.x or v20.x or higher (tested on Node v24.22.1)
- npm or pnpm or yarn

### Step-by-Step Setup
```bash
# 1. Navigate to project root
cd C:\Users\tusha\.gemini\antigravity\scratch\bhabachyaka-express

# 2. Install dependencies
npm install

# 3. Synchronize database schema
npx prisma db push

# 4. Populate realistic demo records
node scripts/seed.mjs

# 5. Run automated unit & integration tests
npx vitest run

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (redirects to `http://localhost:3000/bn`).

---

## 2. Seeded Demonstration Credentials

| Role | Email | Password | Primary Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@bhabachyaka.com` | `password123` | `/[locale]/super-admin` |
| **Operator Owner** | `owner@bhabachyaka.com` | `password123` | `/[locale]/operator/dashboard` |
| **Transport Manager** | `manager@bhabachyaka.com` | `password123` | `/[locale]/operator/dashboard` |
| **Counter Agent (POS)** | `counter@bhabachyaka.com` | `password123` | `/[locale]/counter/pos` |
| **Boarding Officer** | `boarding@bhabachyaka.com` | `password123` | `/[locale]/boarding` |
| **Customer** | `customer@bhabachyaka.com` | `password123` | `/[locale]/account` |

*Note: Use the interactive floating role switcher pill in the bottom right corner of any page to switch seamlessly between roles during testing without retyping credentials.*

---

## 3. Production Deployment (Vercel, AWS, or Docker)

### Build Command
```bash
npm run build
```

### Production Start
```bash
npm start
```

### Production Database Switch (PostgreSQL)
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Set `DATABASE_URL="postgresql://user:pass@host:5432/bhabachyaka_db"` in environment variables and execute:
```bash
npx prisma migrate deploy
```
