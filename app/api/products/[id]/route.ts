import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';
import { CATEGORY_LABELS } from '@/lib/products';
import { TOP_LEAGUES, getTeamsForLeague } from '@/lib/teams';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { name, price, image, description, sizes, category, league, team } = await request.json();
  const validCategories = Object.keys(CATEGORY_LABELS);

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }
  if (!validCategories.includes(category)) {
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
    `UPDATE products
     SET name=$1, price=$2, image=$3, description=$4, sizes=$5, category=$6, league=$7, team=$8
     WHERE id=$9 RETURNING *`,
    [name, price, image, description, JSON.stringify(sizes), category, league, team, id]
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
  if ((session?.user as { role?: string } | null)?.role !== 'admin') {
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
