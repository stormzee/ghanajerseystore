import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getPool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await ensureSchema();
    const db = getPool();

    const result = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    // Always respond with success to avoid user enumeration
    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE LOWER(email)=LOWER($3)',
      [token, expires, email]
    );

    const resetUrl = `${process.env.NEXTAUTH_URL ?? ''}/auth/reset-password?token=${token}`;

    // If an email provider is configured, send the email.
    // For now, we return the link in the response so it can be shown to the user.
    // In production, set EMAIL_FROM and EMAIL_SERVER to send real emails.
    if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
      try {
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.default.createTransport(process.env.EMAIL_SERVER);
        await transport.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Reset your adumpzkanta.store password',
          text: `Click the link below to reset your password (valid for 1 hour):\n\n${resetUrl}`,
          html: `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
        return NextResponse.json({ success: true });
      } catch (mailErr) {
        console.error('Email send error:', mailErr);
        // Fall through to return reset URL in response
      }
    }

    // Return the reset URL so the front-end can display it when email is not configured
    return NextResponse.json({ success: true, resetUrl });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Request failed. Please try again.' }, { status: 500 });
  }
}
