import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { delivery_status } = await request.json();

  const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!VALID_STATUSES.includes(delivery_status)) {
    return NextResponse.json({ error: 'Invalid delivery_status' }, { status: 400 });
  }

  await ensureSchema();
  const result = await getPool().query(
    'UPDATE orders SET delivery_status=$1 WHERE id=$2 RETURNING *',
    [delivery_status, id]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}
