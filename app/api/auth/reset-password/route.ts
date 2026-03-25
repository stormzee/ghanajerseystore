import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await ensureSchema();
    const db = getPool();

    const result = await db.query(
      `SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()`,
      [token]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await db.query(
      `UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2`,
      [password_hash, result.rows[0].id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Password reset failed. Please try again.' }, { status: 500 });
  }
}
