# Ghana Jersey Store ⭐

A minimal, modern, and professional e-commerce website for selling Ghana football jerseys on a **preorder basis**.

![Homepage](https://github.com/user-attachments/assets/394027bb-d901-4960-95c7-9bc8cd4dd23d)
![Shop](https://github.com/user-attachments/assets/b1977dcc-5693-4222-886f-4cdf80cf7993)

## Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with Ghana-inspired gold/green accents
- **Backend:** Next.js API Routes
- **Database:** SQLite via `better-sqlite3`

## Features

| Feature | Description |
|---|---|
| 🏠 Homepage | Hero banner, featured jerseys, call-to-action |
| 🛍️ Shop | Full product grid (6 jerseys) with category badges |
| 📦 Product Detail | Size selector, quantity control, Add to Cart |
| 🛒 Cart | Item management, order summary, Place Preorder |
| 📋 Preorder Form | Name, phone, email, location, notes — saved to SQLite |
| 🔔 Success State | "Your preorder has been received" confirmation |
| 🔧 Admin Panel | `/admin` — view all orders in a table (no auth needed) |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/stormzee/ghanajerseystore.git
cd ghanajerseystore

# Install dependencies
npm install

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
│   ├── db.ts                 # SQLite setup
│   └── products.ts           # Product seed data
└── public/
    └── jerseys/              # SVG jersey illustrations
```

## Data Model

**Product** (`lib/products.ts`)
```
id | name | price | image | description | sizes | category
```

**Order** (SQLite `orders.db`)
```
id | customer_name | phone | email | location | notes | items | total_price | created_at
```

## Admin Panel

Visit `/admin` to view all preorders. No authentication required (simple internal view).

## UI Design

- White background, black text
- Ghana Gold (`#FFC107`) and Ghana Green (`#006B3F`) accents
- Mobile-first responsive layout
- Custom SVG jersey illustrations
