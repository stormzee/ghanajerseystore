import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/orders/[id]/cancel
 *
 * Cancellation rules:
 *   - "pending"    → user can cancel directly (sets delivery_status = "cancelled")
 *   - "processing" → user can request cancellation (sets cancellation_requested = true)
 *   - "shipped"    → user can request cancellation (sets cancellation_requested = true)
 *   - "delivered"  → cannot be cancelled
 *   - "cancelled"  → already cancelled
 *
 * Auth: authenticated users can cancel/request on their own orders.
 *       Guest users supply their email in the request body for verification.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const session = await auth();
  const body = await request.json().catch(() => ({})) as { email?: string };

  const db = getPool();

  // Fetch the order
  const { rows } = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  const order = rows[0] as {
    id: number;
    user_id: number | null;
    email: string | null;
    delivery_status: string;
    cancellation_requested: boolean;
  };

  // Authorization: must own the order (by user_id or matching email)
  const isAuthUser =
    session?.user?.id &&
    session.user.id !== 'admin' &&
    !isNaN(parseInt(session.user.id, 10)) &&
    order.user_id === parseInt(session.user.id, 10);

  const guestEmail = (body?.email ?? '').trim().toLowerCase();
  const isGuestMatch =
    !session &&
    guestEmail &&
    order.email &&
    order.email.toLowerCase() === guestEmail;

  // Also allow if the session email matches the order email (e.g. guest order later signed in)
  const isEmailMatch =
    session?.user?.email &&
    order.email &&
    order.email.toLowerCase() === session.user.email.toLowerCase();

  if (!isAuthUser && !isGuestMatch && !isEmailMatch) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = order.delivery_status;

  if (status === 'delivered') {
    return NextResponse.json(
      { error: 'Delivered orders cannot be cancelled.' },
      { status: 400 }
    );
  }

  if (status === 'cancelled') {
    return NextResponse.json(
      { error: 'Order is already cancelled.' },
      { status: 400 }
    );
  }

  if (status === 'pending') {
    // Direct cancel
    const { rows: updated } = await db.query(
      `UPDATE orders
          SET delivery_status = 'cancelled', cancellation_requested = FALSE
        WHERE id = $1
        RETURNING *`,
      [orderId]
    );
    return NextResponse.json(updated[0]);
  }

  // processing or shipped → request cancellation
  if (order.cancellation_requested) {
    return NextResponse.json(
      { error: 'Cancellation already requested for this order.' },
      { status: 400 }
    );
  }

  const { rows: updated } = await db.query(
    `UPDATE orders
        SET cancellation_requested = TRUE
      WHERE id = $1
      RETURNING *`,
    [orderId]
  );
  return NextResponse.json(updated[0]);
}
