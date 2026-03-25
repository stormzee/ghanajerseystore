'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  Package, Edit2, Trash2, Plus, Upload, Check, X,
  Clock, RefreshCw, Truck, CheckCircle, XCircle,
} from 'lucide-react';

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
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const CATEGORIES = ['home', 'away', 'training'] as const;
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
  const [category, setCategory] = useState(initial?.category ?? 'home');
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
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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

type Tab = 'orders' | 'products';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('orders');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<Product | null | false>(false); // false = closed, null = new

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on mount
  useEffect(() => {
    if (status !== 'authenticated') return;
    const load = async () => {
      setLoading(true);
      try {
        const [prods, ords] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/orders').then(r => r.json()),
        ]);
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(ords)) setOrders(ords);
        else if (ords?.error) setError(String(ords.error));
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [status]);

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

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>;
  }
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Admin Panel</h1>
        <p className="text-gray-500 mb-8">Sign in with your admin Google account to access this page.</p>
        <button
          onClick={() => signIn('google')}
          className="bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Signed in as <strong>{session.user?.email}</strong></p>
        </div>
        <span className="bg-ghana-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase">Admin</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Products ({products.length})
        </button>
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {/* ── Orders Tab ── */}
      {!loading && tab === 'orders' && (
        orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No orders yet.</p>
          </div>
        ) : (
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
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="px-4 py-3 min-w-[180px]">
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
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toISOString().replace('T', ' ').slice(0, 16)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
