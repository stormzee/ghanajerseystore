import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useCrypto } from '../contexts/CryptoContext';

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

export default function Register() {
  const { register: authRegister, user } = useAuth();
  const { publicKeyB64, ready: cryptoReady } = useCrypto();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.confirm) {
      setError('confirm', { message: 'Passwords do not match' });
      return;
    }
    try {
      // Pass the public key so server can store it immediately
      await authRegister(data.username, data.email, data.password, publicKeyB64 ?? undefined);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Registration failed';
      setError('root', { message: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join TaskCollab – find people, build together</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('confirm', { required: 'Please confirm your password' })}
            />
            {errors.confirm && (
              <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
              {errors.root.message}
            </p>
          )}

          {!cryptoReady && (
            <p className="text-xs text-amber-600">Generating encryption keys…</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
