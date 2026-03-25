'use client';

import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending:    { label: 'Pending',    icon: <Clock className="w-4 h-4" />,        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  processing: { label: 'Processing', icon: <RefreshCw className="w-4 h-4" />,    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  shipped:    { label: 'Shipped',    icon: <Truck className="w-4 h-4" />,         color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered:  { label: 'Delivered',  icon: <CheckCircle className="w-4 h-4" />,  color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  cancelled:  { label: 'Cancelled',  icon: <XCircle className="w-4 h-4" />,      color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1 border text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const r = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await r.json();
      if (Array.isArray(data)) {
        setOrders(data);
        setSubmittedEmail(email);
        setSearched(true);
      } else {
        setError('Failed to load orders.');
      }
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Track Your Orders</h1>
        <p className="text-gray-500 text-sm">Enter the email address you used when placing your order.</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-8 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white font-bold px-6 py-2.5 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Looking up…' : 'Look up orders'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">{error}</div>
      )}

      {searched && !loading && !error && orders.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-medium">No orders found.</p>
          <p className="text-sm mt-2">No orders were placed with <strong>{submittedEmail}</strong>.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          <p className="text-gray-500 text-sm">Showing orders for <strong>{submittedEmail}</strong></p>
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-gray-500 text-sm">Order #{order.id}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.delivery_status} />
                  <span className="font-bold text-gray-900">${order.total_price.toFixed(2)}</span>
                </div>
              </div>

              {/* Order body */}
              <div className="px-5 py-4 space-y-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Delivery to:</span> {order.location}
                </div>
                <ul className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <li key={i} className="py-2 flex justify-between text-sm text-gray-700">
                      <span>{item.name} — {item.size} × {item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="text-xs text-gray-400 italic">Note: {order.notes}</p>
                )}
              </div>

              {/* Status timeline hint */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {['pending', 'processing', 'shipped', 'delivered'].map((s, idx) => {
                    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
                    const currentIdx = statuses.indexOf(order.delivery_status);
                    const active = idx <= currentIdx;
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <div key={s} className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${active ? cfg.color : 'text-gray-300'}`}>
                          {cfg.label}
                        </span>
                        {idx < 3 && (
                          <span className={`text-xs ${active && idx < currentIdx ? 'text-gray-400' : 'text-gray-200'}`}>→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
