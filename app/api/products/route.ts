import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const result = await getPool().query('SELECT * FROM products ORDER BY id ASC');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, price, image, description, sizes, category } = await request.json();
  await ensureSchema();
  const result = await getPool().query(
    `INSERT INTO products (name, price, image, description, sizes, category)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, price, image || '', description || '', JSON.stringify(sizes ?? ['S', 'M', 'L', 'XL']), category || 'home']
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
