'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Package, Edit2, Trash2, Plus, Upload, Check, X,
  Clock, RefreshCw, Truck, CheckCircle, XCircle, Users,
  BarChart2, TrendingUp, ShoppingCart, DollarSign, AlertTriangle,
  Globe, Eye,
} from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/products';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  category: string;
}

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  location: string;
  notes: string | null;
  items: OrderItem[];
  total_price: number;
  delivery_status: string;
  cancellation_requested: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

interface AnalyticsData {
  users: { total: number; newThisMonth: number };
  orders: {
    total: number;
    byStatus: { status: string; count: number }[];
    totalRevenue: number;
    revenueThisMonth: number;
    averageOrderValue: number;
  };
  products: {
    total: number;
    byCategory: { category: string; count: number }[];
  };
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  dailyRevenue: { day: string; orders: number; revenue: number }[];
  categorySales: { category: string; orderCount: number; revenue: number }[];
  visitors: {
    totalViews: number;
    viewsToday: number;
    viewsThisMonth: number;
    uniqueIps: number;
    topPages: { path: string; count: number }[];
    topCountries: { country: string; count: number }[];
    dailyTraffic: { day: string; views: number; uniqueVisitors: number }[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[];
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending:    { label: 'Pending',    icon: <Clock className="w-3.5 h-3.5" />,       color: 'text-amber-600' },
  processing: { label: 'Processing', icon: <RefreshCw className="w-3.5 h-3.5" />,   color: 'text-blue-600' },
  shipped:    { label: 'Shipped',    icon: <Truck className="w-3.5 h-3.5" />,        color: 'text-purple-600' },
  delivered:  { label: 'Delivered',  icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-600' },
  cancelled:  { label: 'Cancelled',  icon: <XCircle className="w-3.5 h-3.5" />,     color: 'text-red-600' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Product | null;
  onSave: (p: Product) => void;
  onClose: () => void;
}

function ProductForm({ initial, onSave, onClose }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? [...DEFAULT_SIZES]);
  const [category, setCategory] = useState(initial?.category ?? 'jersey-home');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? 'Upload failed'); return; }
    setImage(data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { name, price: parseFloat(price), image, description, sizes, category };
    const url = initial ? `/api/products/${initial.id}` : '/api/products';
    const method = initial ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">{initial ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ghana-gold text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ghana-gold text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ghana-gold text-sm bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex gap-2">
              <input value={image} onChange={e => setImage(e.target.value)} placeholder="/jerseys/home-jersey.svg"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ghana-gold text-sm" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                disabled={uploading}>
                <Upload className="w-4 h-4" />
                {uploading ? '…' : 'Upload'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-lg border border-gray-200" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ghana-gold text-sm resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
            <div className="flex gap-2 flex-wrap">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                <button key={s} type="button" onClick={() => toggleSize(s)}
                  className={`w-12 h-10 border-2 rounded-lg text-sm font-bold transition-all ${
                    sizes.includes(s) ? 'border-ghana-gold bg-ghana-gold text-black' : 'border-gray-300 text-gray-500 hover:border-ghana-gold'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors text-sm disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

type Tab = 'analytics' | 'orders' | 'products' | 'users';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string } | null)?.role ?? 'user';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';

  const [tab, setTab] = useState<Tab>('analytics');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<Product | null | false>(false); // false = closed, null = new

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<Record<number, string>>({});

  // Users state (admin only)
  const [users, setUsers] = useState<User[]>([]);
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);

  // Analytics state (admin only)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on mount
  useEffect(() => {
    if (status !== 'authenticated') return;
    const load = async () => {
      setLoading(true);
      try {
        const fetches: Promise<unknown>[] = [
          fetch('/api/orders').then(r => r.json()),
        ];
        if (isAdmin) {
          fetches.push(
            fetch('/api/products').then(r => r.json()),
            fetch('/api/users').then(r => r.json()),
          );
        }
        const [ords, prods, usrs] = await Promise.all(fetches);
        if (Array.isArray(ords)) setOrders(ords as Order[]);
        else if ((ords as { error?: string })?.error) setError(String((ords as { error?: string }).error));
        if (Array.isArray(prods)) setProducts(prods as Product[]);
        if (Array.isArray(usrs)) setUsers(usrs as User[]);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    void load();

    // Load analytics separately (admin only)
    if (isAdmin) {
      setAnalyticsLoading(true);
      fetch('/api/analytics')
        .then(r => r.json())
        .then(data => { if (!data.error) setAnalytics(data as AnalyticsData); })
        .catch(() => { /* analytics failure is non-critical */ })
        .finally(() => setAnalyticsLoading(false));
    }
  }, [status, isAdmin]);

  // Delivery status update
  const updateStatus = async (orderId: number, newStatus: string) => {
    setStatusUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status: newStatus }),
    });
    const data = await res.json();
    setStatusUpdating(null);
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, delivery_status: data.delivery_status } : o));
      setStatusMsg(prev => ({ ...prev, [orderId]: '✓' }));
      setTimeout(() => setStatusMsg(prev => { const n = { ...prev }; delete n[orderId]; return n; }), 2000);
    }
  };

  // Product delete
  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Product saved (create or update)
  const onProductSaved = (saved: Product) => {
    setProducts(prev => {
      const existing = prev.find(p => p.id === saved.id);
      return existing ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev];
    });
    setProductForm(false);
  };

  // User role update (admin only)
  const updateUserRole = async (userId: number, newRole: string) => {
    setRoleUpdating(userId);
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    setRoleUpdating(null);
    if (res.ok) {
      const updated = await res.json() as User;
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    }
  };

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>;
  }
  if (!session) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      setLoginLoading(true);
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      setLoginLoading(false);
      if (result?.error) {
        setLoginError('Invalid email or password.');
      }
    };
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Admin Panel</h1>
        <p className="text-gray-500 mb-8 text-center">Sign in to manage your store.</p>
        <form onSubmit={handleLogin} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-5">
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{loginError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors disabled:opacity-50"
          >
            {loginLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            {isManager ? 'Manager Panel' : 'Admin Panel'}
          </h1>
          <p className="text-gray-500 text-sm">Signed in as <strong>{session.user?.email}</strong></p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="bg-ghana-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase">Admin</span>
          )}
          {isManager && (
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Manager</span>
          )}
          <button
            onClick={() => void signOut()}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {isAdmin && (
          <button
            onClick={() => setTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'analytics' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Analytics
          </button>
        )}
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Orders ({orders.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Products ({products.length})
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'users' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Users ({users.length})
          </button>
        )}
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {/* ── Analytics Tab ── */}
      {!loading && tab === 'analytics' && isAdmin && (
        analyticsLoading ? (
          <div className="text-center py-12 text-gray-400">Loading analytics…</div>
        ) : !analytics ? (
          <div className="text-center py-12 text-gray-400">No analytics data available.</div>
        ) : (
          <div className="space-y-8">

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <div className="bg-green-100 rounded-lg p-2.5 flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Revenue</p>
                  <p className="text-2xl font-extrabold text-gray-900">${analytics.orders.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-600 mt-0.5">+${analytics.orders.revenueThisMonth.toFixed(2)} this month</p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <div className="bg-blue-100 rounded-lg p-2.5 flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Orders</p>
                  <p className="text-2xl font-extrabold text-gray-900">{analytics.orders.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Avg ${analytics.orders.averageOrderValue.toFixed(2)} / order</p>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <div className="bg-purple-100 rounded-lg p-2.5 flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Registered Users</p>
                  <p className="text-2xl font-extrabold text-gray-900">{analytics.users.total}</p>
                  <p className="text-xs text-purple-600 mt-0.5">+{analytics.users.newThisMonth} this month</p>
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <div className="bg-amber-100 rounded-lg p-2.5 flex-shrink-0">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Products Listed</p>
                  <p className="text-2xl font-extrabold text-gray-900">{analytics.products.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{analytics.products.byCategory.length} categories</p>
                </div>
              </div>
            </div>

            {/* ── Order Status Breakdown ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Order Status Breakdown
                </h3>
                <div className="space-y-3">
                  {analytics.orders.byStatus.map(({ status, count }) => {
                    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
                    const pct = analytics.orders.total > 0
                      ? Math.round((count / analytics.orders.total) * 100)
                      : 0;
                    const barColors: Record<string, string> = {
                      pending: 'bg-amber-400',
                      processing: 'bg-blue-400',
                      shipped: 'bg-purple-400',
                      delivered: 'bg-green-500',
                      cancelled: 'bg-red-400',
                    };
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColors[status] ?? 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {analytics.orders.byStatus.length === 0 && (
                    <p className="text-gray-400 text-sm">No orders yet.</p>
                  )}
                </div>
              </div>

              {/* ── Top Selling Products ── */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Top Selling Products
                </h3>
                {analytics.topProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No sales data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-800 truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-400">{p.unitsSold} sold</span>
                          <span className="text-xs font-semibold text-green-600">${p.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Revenue Trend (last 30 days) ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Revenue Trend — Last 30 Days
              </h3>
              {analytics.dailyRevenue.length === 0 ? (
                <p className="text-gray-400 text-sm">No revenue data in the last 30 days.</p>
              ) : (() => {
                const maxRev = Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1);
                return (
                  <div className="flex items-end gap-1 h-28 w-full overflow-x-auto pb-1">
                    {analytics.dailyRevenue.map(d => {
                      const heightPct = Math.max((d.revenue / maxRev) * 100, 2);
                      return (
                        <div key={d.day} className="flex flex-col items-center gap-1 flex-1 min-w-[18px] group relative">
                          <div
                            className="w-full bg-ghana-gold rounded-t-sm transition-all group-hover:bg-amber-500"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[9px] text-gray-400 rotate-45 origin-top-left translate-x-1 w-10 overflow-hidden hidden sm:block">
                            {d.day.slice(5)}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
                            {d.day}: ${d.revenue.toFixed(2)} ({d.orders} order{d.orders !== 1 ? 's' : ''})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* ── Category Sales ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Revenue by Category
              </h3>
              {analytics.categorySales.length === 0 ? (
                <p className="text-gray-400 text-sm">No category sales data yet.</p>
              ) : (() => {
                const maxRev = Math.max(...analytics.categorySales.map(c => c.revenue), 1);
                return (
                  <div className="space-y-3">
                    {analytics.categorySales.map(c => {
                      const pct = Math.round((c.revenue / maxRev) * 100);
                      const label = (CATEGORY_LABELS as Record<string, string>)[c.category] ?? c.category;
                      return (
                        <div key={c.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{label}</span>
                            <span className="text-xs text-gray-500">{c.orderCount} orders · ${c.revenue.toFixed(2)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-ghana-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* ── User Behaviour: New Users Snapshot ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> User Behaviour Snapshot
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: analytics.users.total, sub: 'registered accounts' },
                  { label: 'New This Month', value: analytics.users.newThisMonth, sub: 'sign-ups' },
                  { label: 'Unique Buyers', value: (() => {
                    const emailSet = new Set(orders.filter(o => o.email).map(o => o.email!));
                    return emailSet.size;
                  })(), sub: 'unique buyer emails' },
                  { label: 'Avg Order Value', value: `$${analytics.orders.averageOrderValue.toFixed(2)}`, sub: 'per order' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{stat.label}</p>
                    <p className="text-xs text-gray-400">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Visitor & Traffic Analytics ── */}
            {analytics.visitors && (
              <div className="space-y-6">
                {/* Visitor Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="bg-teal-100 rounded-lg p-2.5 flex-shrink-0">
                      <Eye className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Page Views</p>
                      <p className="text-2xl font-extrabold text-gray-900">{analytics.visitors.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-teal-600 mt-0.5">+{analytics.visitors.viewsThisMonth.toLocaleString()} this month</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="bg-sky-100 rounded-lg p-2.5 flex-shrink-0">
                      <Eye className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Views Today</p>
                      <p className="text-2xl font-extrabold text-gray-900">{analytics.visitors.viewsToday.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">page loads</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="bg-indigo-100 rounded-lg p-2.5 flex-shrink-0">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Unique IPs</p>
                      <p className="text-2xl font-extrabold text-gray-900">{analytics.visitors.uniqueIps.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">distinct visitors</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="bg-rose-100 rounded-lg p-2.5 flex-shrink-0">
                      <Globe className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Countries</p>
                      <p className="text-2xl font-extrabold text-gray-900">{analytics.visitors.topCountries.length}</p>
                      <p className="text-xs text-gray-400 mt-0.5">tracked so far</p>
                    </div>
                  </div>
                </div>

                {/* Traffic Trend + Top Countries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Traffic (last 30 days) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Daily Traffic — Last 30 Days
                    </h3>
                    {analytics.visitors.dailyTraffic.length === 0 ? (
                      <p className="text-gray-400 text-sm">No traffic data yet.</p>
                    ) : (() => {
                      const maxViews = Math.max(...analytics.visitors.dailyTraffic.map(d => d.views), 1);
                      return (
                        <div className="flex items-end gap-1 h-28 w-full overflow-x-auto pb-1">
                          {analytics.visitors.dailyTraffic.map(d => {
                            const heightPct = Math.max((d.views / maxViews) * 100, 2);
                            return (
                              <div key={d.day} className="flex flex-col items-center gap-1 flex-1 min-w-[18px] group relative">
                                <div
                                  className="w-full bg-teal-400 rounded-t-sm transition-all group-hover:bg-teal-600"
                                  style={{ height: `${heightPct}%` }}
                                />
                                <span className="text-[9px] text-gray-400 rotate-45 origin-top-left translate-x-1 w-10 overflow-hidden hidden sm:block">
                                  {d.day.slice(5)}
                                </span>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
                                  {d.day}: {d.views} view{d.views !== 1 ? 's' : ''} ({d.uniqueVisitors} unique)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Top Countries */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Visitors by Country
                    </h3>
                    {analytics.visitors.topCountries.length === 0 ? (
                      <p className="text-gray-400 text-sm">No location data yet.</p>
                    ) : (() => {
                      const maxCount = Math.max(...analytics.visitors.topCountries.map(c => c.count), 1);
                      return (
                        <div className="space-y-3">
                          {analytics.visitors.topCountries.map(c => {
                            const pct = Math.round((c.count / maxCount) * 100);
                            return (
                              <div key={c.country}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700">{c.country}</span>
                                  <span className="text-xs text-gray-500">{c.count.toLocaleString()} views</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Most Visited Pages
                  </h3>
                  {analytics.visitors.topPages.length === 0 ? (
                    <p className="text-gray-400 text-sm">No page view data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.visitors.topPages.map((p, i) => (
                        <div key={p.path} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-800 truncate font-mono">{p.path}</span>
                          </div>
                          <span className="text-xs font-semibold text-teal-600 flex-shrink-0 ml-2">
                            {p.count.toLocaleString()} views
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )
      )}

      {/* ── Orders Tab ── */}
      {!loading && tab === 'orders' && (
        orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No orders yet.</p>
          </div>
        ) : (
          <>
            {/* Cancellation request banner */}
            {orders.some(o => o.cancellation_requested && o.delivery_status !== 'cancelled') && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-2 text-orange-800 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {orders.filter(o => o.cancellation_requested && o.delivery_status !== 'cancelled').length} order(s) have pending cancellation requests. Review them below.
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Order #', 'Customer', 'Phone', 'Email', 'Location', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${order.cancellation_requested && order.delivery_status !== 'cancelled' ? 'bg-orange-50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-gray-500">#{order.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-600">{order.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{order.email ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{order.location}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <ul className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <li key={i}>{item.name} — {item.size} × {item.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">${order.total_price.toFixed(2)}</td>
                      <td className="px-4 py-3 min-w-[220px]">
                        {order.cancellation_requested && order.delivery_status !== 'cancelled' && (
                          <div className="flex items-center gap-1 text-orange-600 text-xs font-semibold mb-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            Cancellation requested
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.delivery_status}
                            disabled={statusUpdating === order.id}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-ghana-gold disabled:opacity-50"
                          >
                            {DELIVERY_STATUSES.map(s => (
                              <option key={s} value={s}>
                                {STATUS_CONFIG[s]?.label ?? s}
                              </option>
                            ))}
                          </select>
                          {statusMsg[order.id] ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <StatusBadge status={order.delivery_status} />
                          )}
                        </div>
                        {order.cancellation_requested && order.delivery_status !== 'cancelled' && (
                          <button
                            disabled={statusUpdating === order.id}
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 rounded-md px-2 py-1 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Approve Cancel
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toISOString().replace('T', ' ').slice(0, 16)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {/* ── Products Tab ── */}
      {!loading && tab === 'products' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setProductForm(null)}
              className="flex items-center gap-2 bg-black text-white font-bold px-4 py-2 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No products yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-full h-40 object-cover bg-gray-50" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</h3>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">${parseFloat(String(p.price)).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{p.sizes?.join(', ')}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setProductForm(p)} className="text-gray-400 hover:text-ghana-gold transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {productForm !== false && (
        <ProductForm
          initial={productForm}
          onSave={onProductSaved}
          onClose={() => setProductForm(false)}
        />
      )}

      {/* ── Users Tab ── */}
      {!loading && tab === 'users' && isAdmin && (
        users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No registered users yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#', 'Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-500">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(u.created_at).toISOString().replace('T', ' ').slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'user' ? (
                        <button
                          disabled={roleUpdating === u.id}
                          onClick={() => updateUserRole(u.id, 'manager')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                        >
                          {roleUpdating === u.id ? 'Updating…' : 'Promote to Manager'}
                        </button>
                      ) : u.role === 'manager' ? (
                        <button
                          disabled={roleUpdating === u.id}
                          onClick={() => updateUserRole(u.id, 'user')}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                        >
                          {roleUpdating === u.id ? 'Updating…' : 'Demote to User'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
