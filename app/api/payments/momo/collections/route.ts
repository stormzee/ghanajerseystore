import { NextResponse } from 'next/server';
import { requestMomoCollection } from '@/lib/momo';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await requestMomoCollection({
      amount: Number(body.amount),
      currency: body.currency || 'GHS',
      phoneNumber: String(body.phoneNumber || ''),
      externalId: String(body.externalId || `order-${Date.now()}`),
      payerMessage: body.payerMessage,
      payeeNote: body.payeeNote,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status });
    }

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 });
  }
}
