# Ghana Jersey Store ⭐

A minimal, modern, and professional e-commerce website for selling Ghana football jerseys on a **preorder basis**.

![Homepage](https://github.com/user-attachments/assets/9a3c01ac-600a-465f-a9ff-44f5b3fd47c1)

## Tech Stack

- **Frontend:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS with Ghana-inspired gold/green accents
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (via `pg` driver)

## Features

| Feature | Description |
|---|---|
| 🏠 Homepage | Hero banner, featured jerseys, call-to-action |
| 🛍️ Shop | Full product grid (6 jerseys) with category badges |
| 📦 Product Detail | Size selector, quantity control, Add to Cart |
| 🛒 Cart | Item management, order summary, Place Preorder |
| 📋 Preorder Form | Name, phone, email, location, notes — saved to PostgreSQL |
| 🔔 Success State | "Your preorder has been received" confirmation |
| 🔧 Admin Panel | `/admin` — view all orders in a table (no auth needed) |

## 🐳 Local Preview with Docker Compose (recommended)

The fastest way to run the full stack locally — **no Node.js or PostgreSQL installation needed**.

```bash
# Clone the repository
git clone https://github.com/stormzee/ghanajerseystore.git
cd ghanajerseystore

# Build and start both the app and the database
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The first `docker compose up --build` takes a few minutes to build the image. Subsequent runs are instant because Docker caches the layers.

### What gets created

| Service | Details |
|---|---|
| `app` | Next.js production server on port `3000` |
| `db` | PostgreSQL 16 on port `5432` (internal only) |
| `postgres_data` | Named Docker volume — orders persist across restarts |

### Useful commands

```bash
# Run in the background
docker compose up --build -d

# View logs
docker compose logs -f app

# Stop everything
docker compose down

# Stop and wipe the database volume
docker compose down -v
```

## Getting Started (without Docker)

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL 14+ running locally

### Installation

```bash
# Clone the repository
git clone https://github.com/stormzee/ghanajerseystore.git
cd ghanajerseystore

# Install dependencies
npm install

# Set up environment (copy and edit with your Postgres credentials)
cp .env.example .env

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── Dockerfile                # Multi-stage production image (node:20-slim)
├── docker-compose.yml        # app + postgres:16 stack
├── .env.example              # Required environment variables
├── app/
│   ├── page.tsx              # Homepage
│   ├── shop/page.tsx         # Product listing
│   ├── product/[id]/page.tsx # Product detail
│   ├── cart/page.tsx         # Cart + Preorder form
│   ├── admin/page.tsx        # Admin orders view
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── api/
│       ├── products/route.ts # GET products
│       └── orders/route.ts   # GET/POST orders
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── context/
│   └── CartContext.tsx       # Client-side cart state
├── lib/
│   ├── db.ts                 # PostgreSQL pool + schema init
│   └── products.ts           # Product seed data
└── public/
    └── jerseys/              # SVG jersey illustrations
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

Copy `.env.example` → `.env` and fill in your credentials:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ghanajerseystore
```

## Data Model

**Product** (`lib/products.ts`)
```
id | name | price | image | description | sizes | category
```

**Order** (PostgreSQL `orders` table)
```
id | customer_name | phone | email | location | notes | items (JSONB) | total_price | created_at
```

## Admin Panel

Visit `/admin` to view all preorders. No authentication required (simple internal view).

## UI Design

- White background, black text
- Ghana Gold (`#FFC107`) and Ghana Green (`#006B3F`) accents
- Mobile-first responsive layout
- Custom SVG jersey illustrations
