import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/invoice?orderId=123
 * Returns the order data for the specified order ID.
 * Access is allowed if the requester is the admin, the order owner (by user_id),
 * or the order was placed with the same email (guest orders).
 */
export async function GET(request: Request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const db = getPool();
    const result = await db.query('SELECT * FROM orders WHERE id=$1', [orderId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const order = result.rows[0];
    const session = await auth();

    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
    const isOwner =
      session?.user?.id &&
      session.user.id !== 'admin' &&
      order.user_id === parseInt(session.user.id, 10);
    const emailParam = searchParams.get('email');
    const isGuestMatch =
      emailParam &&
      order.email &&
      order.email.toLowerCase() === emailParam.toLowerCase();

    if (!isAdmin && !isOwner && !isGuestMatch) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}
