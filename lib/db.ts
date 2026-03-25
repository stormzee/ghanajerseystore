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
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS orders (
      id            SERIAL PRIMARY KEY,
      customer_name TEXT           NOT NULL,
      phone         TEXT           NOT NULL,
      email         TEXT,
      location      TEXT           NOT NULL,
      notes         TEXT,
      items         JSONB          NOT NULL,
      total_price   NUMERIC(10,2)  NOT NULL,
      created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);
  schemaReady = true;
}
