import { randomUUID } from 'crypto';

interface MomoCollectionsPayload {
  amount: number;
  currency: string;
  phoneNumber: string;
  externalId: string;
  payerMessage?: string;
  payeeNote?: string;
}

interface MomoConfig {
  baseUrl: string;
  targetEnvironment: string;
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  callbackUrl?: string;
  currency: string;
}

function getMomoConfig(): { config?: MomoConfig; missing: string[] } {
  const baseUrl = process.env.MOMO_BASE_URL ?? 'https://sandbox.momodeveloper.mtn.com';
  const targetEnvironment = process.env.MOMO_TARGET_ENVIRONMENT ?? 'sandbox';
  const subscriptionKey = process.env.MOMO_COLLECTION_SUBSCRIPTION_KEY ?? '';
  const apiUser = process.env.MOMO_COLLECTION_API_USER ?? '';
  const apiKey = process.env.MOMO_COLLECTION_API_KEY ?? '';
  const callbackUrl = process.env.MOMO_COLLECTION_CALLBACK_URL;
  const currency = process.env.MOMO_COLLECTION_CURRENCY ?? 'GHS';

  const missing: string[] = [];
  if (!subscriptionKey) missing.push('MOMO_COLLECTION_SUBSCRIPTION_KEY');
  if (!apiUser) missing.push('MOMO_COLLECTION_API_USER');
  if (!apiKey) missing.push('MOMO_COLLECTION_API_KEY');

  if (missing.length > 0) return { missing };

  return {
    missing,
    config: {
      baseUrl,
      targetEnvironment,
      subscriptionKey,
      apiUser,
      apiKey,
      callbackUrl,
      currency,
    },
  };
}

function normalizePhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/[^\d]/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0')) return `233${digits.slice(1)}`;
  return digits;
}

async function getCollectionAccessToken(config: MomoConfig): Promise<string> {
  const auth = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64');
  const res = await fetch(`${config.baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get MoMo token: ${text}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function requestMomoCollection(payload: MomoCollectionsPayload) {
  const { config, missing } = getMomoConfig();
  if (!config) {
    return {
      ok: false as const,
      status: 400,
      error: 'MoMo configuration is incomplete.',
      missing,
      instructions: 'Register your collection app and set the required MOMO_* environment variables.',
    };
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, status: 400, error: 'Amount must be a positive number.' };
  }

  const normalizedPhone = normalizePhone(payload.phoneNumber);
  if (!/^233\d{9}$/.test(normalizedPhone)) {
    return { ok: false as const, status: 400, error: 'Phone must be a valid Ghana number.' };
  }

  const referenceId = randomUUID();
  const token = await getCollectionAccessToken(config);

  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': config.targetEnvironment,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toFixed(2),
      currency: payload.currency || config.currency,
      externalId: payload.externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: normalizedPhone,
      },
      payerMessage: payload.payerMessage ?? 'jerseyvault order payment',
      payeeNote: payload.payeeNote ?? 'Jersey purchase',
    }),
  });

  if (!response.ok && response.status !== 202) {
    const text = await response.text();
    return {
      ok: false as const,
      status: response.status,
      error: 'MoMo request-to-pay failed.',
      details: text,
    };
  }

  return {
    ok: true as const,
    status: 202,
    referenceId,
    callbackUrlConfigured: Boolean(config.callbackUrl),
    instructions: 'Payment request sent. Use the reference ID to poll status or reconcile callbacks once webhook setup is complete.',
  };
}
