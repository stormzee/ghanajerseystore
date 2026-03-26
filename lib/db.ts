import { Pool, types } from 'pg';

// PostgreSQL returns NUMERIC as string by default to avoid float precision loss.
// For this app prices have at most 2 decimal places, so a float is fine.
types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));

let pool: Pool | null = null;
let schemaReady = false;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        TEXT           NOT NULL,
      price       NUMERIC(10,2)  NOT NULL,
      image       TEXT           NOT NULL DEFAULT '',
      description TEXT           NOT NULL DEFAULT '',
      sizes       JSONB          NOT NULL DEFAULT '["S","M","L","XL"]',
      category    TEXT           NOT NULL DEFAULT 'jersey-home',
      created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                    SERIAL PRIMARY KEY,
      name                  TEXT           NOT NULL,
      email                 TEXT           NOT NULL UNIQUE,
      password_hash         TEXT           NOT NULL,
      role                  TEXT           NOT NULL DEFAULT 'user',
      reset_token           TEXT,
      reset_token_expires   TIMESTAMPTZ,
      created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);

  // Add role column to existing users tables that predate this migration
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id                      SERIAL PRIMARY KEY,
      customer_name           TEXT           NOT NULL,
      phone                   TEXT           NOT NULL,
      email                   TEXT,
      location                TEXT           NOT NULL,
      notes                   TEXT,
      items                   JSONB          NOT NULL,
      total_price             NUMERIC(10,2)  NOT NULL,
      delivery_status         TEXT           NOT NULL DEFAULT 'pending',
      cancellation_requested  BOOLEAN        NOT NULL DEFAULT FALSE,
      created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);

  // Add delivery_status column if it was missing from an existing table
  await db.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pending'
  `);

  // Add user_id column to orders if not present (links guest orders to user accounts)
  await db.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  `);

  // Add cancellation_requested column if not present
  await db.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_requested BOOLEAN NOT NULL DEFAULT FALSE
  `);

  // ── Page views (visitor tracking) ────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id         SERIAL PRIMARY KEY,
      path       TEXT           NOT NULL,
      ip         TEXT,
      country    TEXT,
      city       TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);

  // Indexes for common analytics query patterns
  await db.query(`
    CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS page_views_ip_idx ON page_views (ip)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS page_views_country_idx ON page_views (country)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path)
  `);

  // Seed products table from static list if empty
  const { rows } = await db.query('SELECT COUNT(*) AS cnt FROM products');
  if (parseInt(rows[0].cnt, 10) === 0) {
    const { staticProducts } = await import('./products');
    for (const p of staticProducts) {
      await db.query(
        `INSERT INTO products (name, price, image, description, sizes, category)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.name, p.price, p.image, p.description, JSON.stringify(p.sizes), p.category]
      );
    }
  }

  schemaReady = true;
}
