import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['user', 'manager'] as const;

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await ensureSchema();
  const result = await getPool().query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return NextResponse.json(result.rows);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, role } = await request.json();

  if (!id || !role) {
    return NextResponse.json({ error: 'id and role are required' }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be one of: ${VALID_ROLES.join(', ')}` },
      { status: 400 }
    );
  }

  await ensureSchema();
  const result = await getPool().query(
    'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role, created_at',
    [role, id]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}
