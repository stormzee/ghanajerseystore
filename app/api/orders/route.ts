import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, email, location, notes, items, total_price } = body;

    await ensureSchema();
    const result = await getPool().query(
      `INSERT INTO orders (customer_name, phone, email, location, notes, items, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [customer_name, phone, email || null, location, notes || null, JSON.stringify(items), total_price]
    );

    return NextResponse.json({ success: true, orderId: result.rows[0].id });
  } catch (error) {
    console.error('Order save error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const result = await getPool().query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
