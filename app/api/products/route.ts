import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';
import { CATEGORY_LABELS } from '@/lib/products';
import { TOP_LEAGUES, getTeamsForLeague } from '@/lib/teams';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const result = await getPool().query('SELECT * FROM products ORDER BY id ASC');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, price, image, description, sizes, category, league, team } = await request.json();

  const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS);
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'category is invalid' }, { status: 400 });
  }
  if (!TOP_LEAGUES.includes(league)) {
    return NextResponse.json({ error: 'league is invalid' }, { status: 400 });
  }
  if (!getTeamsForLeague(league).includes(team)) {
    return NextResponse.json({ error: 'team is invalid for the selected league' }, { status: 400 });
  }
  await ensureSchema();
  const result = await getPool().query(
    `INSERT INTO products (name, price, image, description, sizes, category, league, team)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, price, image || '', description || '', JSON.stringify(sizes ?? ['S', 'M', 'L', 'XL']), category, league, team]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
