import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, email, location, notes, items, total_price } = body;

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO orders (customer_name, phone, email, location, notes, items, total_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(
      customer_name,
      phone,
      email || null,
      location,
      notes || null,
      JSON.stringify(items),
      total_price
    );

    return NextResponse.json({ success: true, orderId: result.lastInsertRowid });
  } catch (error) {
    console.error('Order save error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Record<string, unknown>[];
    return NextResponse.json(
      orders.map(o => ({ ...o, items: JSON.parse(o['items'] as string) }))
    );
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
