# jerseyvault.com

Modern Next.js ecommerce storefront for football jerseys and fan gear.

## What this version includes

- Multi-club catalog (not Ghana-only)
- Club discovery in `/shop` with:
  - search by club/jersey text
  - category filters
  - league filter
  - team filter
- Admin product form with curated top-league team selector:
  - England, Spain, Italy, France, Germany, Netherlands, Portugal, Turkey
- MTN MoMo Collections **skeleton integration**:
  - `/api/payments/momo/collections` request-to-pay endpoint
  - checkout option wired to create MoMo payment requests
  - order metadata stores payment method/provider/reference/status

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- PostgreSQL (`pg`)
- NextAuth credentials auth

## Setup

```bash
npm install
npm run dev
```

## Required environment variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ghanajerseystore
AUTH_SECRET=replace_me
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin
```

## MTN MoMo Collections skeleton variables

Set these when you are ready to connect your MoMo app credentials:

```bash
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_TARGET_ENVIRONMENT=sandbox
MOMO_COLLECTION_SUBSCRIPTION_KEY=
MOMO_COLLECTION_API_USER=
MOMO_COLLECTION_API_KEY=
MOMO_COLLECTION_CALLBACK_URL=
MOMO_COLLECTION_CURRENCY=GHS
```

If these are not set, the MoMo endpoint returns a guided configuration error so you can finish registration and wiring.

## Validation

```bash
npm run lint
npm run build
```
