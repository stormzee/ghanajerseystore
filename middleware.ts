import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type AuthenticatedRequest = NextRequest & { auth?: { user?: { email?: string | null } } | null };

export default auth((req: AuthenticatedRequest) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute) {
    const userEmail = req.auth?.user?.email;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!userEmail || !adminEmail || userEmail !== adminEmail) {
      // Redirect to admin page which contains the login form
      const adminUrl = new URL('/admin', req.url);
      adminUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(adminUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path+'],
};
