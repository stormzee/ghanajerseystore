'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Request failed.');
      } else {
        setSubmitted(true);
        if (data.resetUrl) setResetUrl(data.resetUrl);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-black hover:text-ghana-gold transition-colors">
            <Star className="w-6 h-6 fill-ghana-gold text-ghana-gold" />
            adumpzkanta.store
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-6 mb-2">Forgot your password?</h1>
          <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-ghana-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-ghana-gold" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-4">
                If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
              </p>
              {resetUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    ⚠️ Email not configured — here is your reset link:
                  </p>
                  <Link
                    href={resetUrl}
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}
              <Link href="/auth/signin" className="text-ghana-gold font-semibold hover:underline text-sm">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ghana-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  <Link href="/auth/signin" className="text-ghana-gold hover:underline">
                    ← Back to sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
