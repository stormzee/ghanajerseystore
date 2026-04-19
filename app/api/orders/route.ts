import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';
import { PAYMENT_METHOD_VALUES, PAYMENT_METHODS } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      phone,
      email,
      location,
      notes,
      items,
      total_price,
      payment_method,
      payment_provider,
      payment_reference,
      payment_status,
    } = body;

    const resolvedPaymentMethod = PAYMENT_METHOD_VALUES.includes(payment_method) ? payment_method : PAYMENT_METHODS.CASH;
    const resolvedPaymentStatus = typeof payment_status === 'string' && payment_status.trim() ? payment_status : 'pending';

    await ensureSchema();

    // Link order to authenticated user account if signed in
    const session = await auth();
    let userId: number | null = null;
    if (session?.user?.id && session.user.id !== 'admin') {
      const idNum = parseInt(session.user.id, 10);
      if (!isNaN(idNum)) userId = idNum;
    }

    const result = await getPool().query(
      `INSERT INTO orders (
         customer_name, phone, email, location, notes, items, total_price, user_id,
         payment_method, payment_provider, payment_reference, payment_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        customer_name,
        phone,
        email || null,
        location,
        notes || null,
        JSON.stringify(items),
        total_price,
        userId,
        resolvedPaymentMethod,
        payment_provider || null,
        payment_reference || null,
        resolvedPaymentStatus,
      ]
    );

    return NextResponse.json({ success: true, orderId: result.rows[0].id });
  } catch (error) {
    console.error('Order save error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');

    const session = await auth();

    // Admin or manager: fetch all orders (no email filter)
    if (!emailParam) {
      const role = (session?.user as { role?: string } | null)?.role;
      if (role !== 'admin' && role !== 'manager') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const result = await getPool().query('SELECT * FROM orders ORDER BY created_at DESC');
      return NextResponse.json(result.rows);
    }

    // Authenticated users can look up their own orders by email or via session
    if (session?.user?.id && session.user.id !== 'admin' && session.user.email) {
      // User is signed in — only allow fetching their own orders
      const result = await getPool().query(
        `SELECT * FROM orders WHERE (user_id = $1 OR LOWER(email) = LOWER($2)) ORDER BY created_at DESC`,
        [parseInt(session.user.id, 10), session.user.email]
      );
      return NextResponse.json(result.rows);
    }

    // Guest lookup by email (no auth required, like before)
    const result = await getPool().query(
      'SELECT * FROM orders WHERE LOWER(email)=LOWER($1) ORDER BY created_at DESC',
      [emailParam]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
