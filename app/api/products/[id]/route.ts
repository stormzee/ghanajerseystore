import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { name, price, image, description, sizes, category } = await request.json();
  await ensureSchema();
  const result = await getPool().query(
    `UPDATE products
     SET name=$1, price=$2, image=$3, description=$4, sizes=$5, category=$6
     WHERE id=$7 RETURNING *`,
    [name, price, image, description, JSON.stringify(sizes), category, id]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await ensureSchema();
  const result = await getPool().query('DELETE FROM products WHERE id=$1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
