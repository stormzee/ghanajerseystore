import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Free IP geolocation using ip-api.com (no key required, 45 req/min limit on free tier).
// NOTE: ip-api.com free tier only allows HTTP on the JSON endpoint; HTTPS requires a paid key.
// IP addresses are sent to a third-party service. Consider a self-hosted alternative for stricter
// privacy requirements.
async function geolocateIp(ip: string): Promise<{ country: string | null; city: string | null }> {
  // Private/loopback and APIPA addresses cannot be geolocated
  if (
    !ip ||
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') ||
    // 172.16.0.0/12 private range
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  ) {
    return { country: null, city: null };
  }
  try {
    // ip-api.com free tier only supports HTTP (HTTPS requires a paid subscription)
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { country: null, city: null };
    const data = (await res.json()) as { status?: string; country?: string; city?: string };
    if (data.status === 'success') {
      return { country: data.country ?? null, city: data.city ?? null };
    }
  } catch {
    // geolocation is best-effort; never block the response
  }
  return { country: null, city: null };
}

function extractIp(req: NextRequest): string | null {
  // Prefer the forwarded-for header (set by reverse proxies / Vercel / Railway)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { path?: unknown };
    // Sanitize path: keep only the first 2000 characters of a string value
    const rawPath = typeof body.path === 'string' ? body.path : '/';
    const path = rawPath.slice(0, 2000);
    const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 500);
    const ip = extractIp(req);

    const { country, city } = await geolocateIp(ip ?? '');

    await ensureSchema();
    const db = getPool();
    await db.query(
      `INSERT INTO page_views (path, ip, country, city, user_agent) VALUES ($1, $2, $3, $4, $5)`,
      [path, ip, country, city, userAgent || null]
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Tracking errors must never surface to the end user
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
