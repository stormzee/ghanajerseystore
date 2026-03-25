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

  const VALID_CATEGORIES = ['home', 'away', 'training'];
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'category must be one of: home, away, training' }, { status: 400 });
  }
  await ensureSchema();
  const result = await getPool().query(
    `INSERT INTO products (name, price, image, description, sizes, category)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, price, image || '', description || '', JSON.stringify(sizes ?? ['S', 'M', 'L', 'XL']), category || 'home']
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
