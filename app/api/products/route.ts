import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(products);
}
