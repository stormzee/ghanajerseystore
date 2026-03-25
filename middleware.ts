import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth?: { user?: { email?: string | null } } | null }) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute) {
    const userEmail = req.auth?.user?.email;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!userEmail || !adminEmail || userEmail !== adminEmail) {
      const signInUrl = new URL('/api/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
