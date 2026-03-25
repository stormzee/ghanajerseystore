import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { timingSafeEqual } from 'crypto';

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (
          adminEmail &&
          adminPassword &&
          typeof credentials?.email === 'string' &&
          typeof credentials?.password === 'string' &&
          secureCompare(credentials.email, adminEmail) &&
          secureCompare(credentials.password, adminPassword)
        ) {
          return { id: '1', email: adminEmail };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
