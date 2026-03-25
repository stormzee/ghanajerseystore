import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import type { Pool } from 'pg';

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function getUserByEmail(email: string) {
  try {
    // Dynamic import to avoid importing pg at auth-config evaluation time
    const { getPool, ensureSchema } = await import('@/lib/db');
    await ensureSchema();
    const db: Pool = getPool();
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Check admin credentials first
        if (
          adminEmail &&
          adminPassword &&
          secureCompare(credentials.email, adminEmail) &&
          secureCompare(credentials.password, adminPassword)
        ) {
          return { id: 'admin', email: adminEmail, name: 'Admin', role: 'admin' };
        }

        // Check regular user credentials
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);
        if (!passwordMatch) return null;

        return { id: String(user.id), email: user.email, name: user.name, role: 'user' };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error role is a custom field
        token.role = user.role ?? 'user';
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      // @ts-expect-error role is a custom field
      session.user.role = token.role ?? 'user';
      return session;
    },
  },
});
