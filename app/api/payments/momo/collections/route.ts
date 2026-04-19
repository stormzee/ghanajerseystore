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
  } catch (error) {
    console.error('MoMo collections request error:', error);
    const message = error instanceof Error ? error.message : 'Invalid payment request.';
    const status = message.toLowerCase().includes('invalid') ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
