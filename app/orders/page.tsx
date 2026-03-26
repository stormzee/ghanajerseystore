'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

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

function InvoiceLink({ order }: { order: Order }) {
  const href = `/invoice/${order.id}${order.email ? `?email=${encodeURIComponent(order.email)}` : ''}`;
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-ghana-gold transition-colors border border-gray-200 hover:border-ghana-gold rounded-lg px-3 py-1.5"
    >
      <FileText className="w-3.5 h-3.5" />
      Invoice
    </Link>
  );
}

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelMsg, setCancelMsg] = useState<Record<number, string>>({});

  const loadOrders = useCallback(async (lookupEmail: string, isAutoLoad = false) => {
    setLoading(true);
    if (!isAutoLoad) setSearched(false);
    setError('');
    try {
      const r = await fetch(`/api/orders?email=${encodeURIComponent(lookupEmail)}`);
      const data = await r.json();
      if (Array.isArray(data)) {
        setOrders(data);
        setSubmittedEmail(lookupEmail);
        setSearched(true);
      } else {
        setError('Failed to load orders.');
      }
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load orders for authenticated users
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.email) {
      void loadOrders(session.user.email, true);
    }
  }, [session?.user?.email, sessionStatus, loadOrders]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadOrders(email);
  };

  const handleCancel = async (order: Order) => {
    const isPending = order.delivery_status === 'pending';
    const confirmMsg = isPending
      ? 'Are you sure you want to cancel this order?'
      : 'Are you sure you want to request cancellation? The admin will review and process it.';
    if (!confirm(confirmMsg)) return;

    setCancellingId(order.id);
    try {
      const body: Record<string, string> = {};
      if (!session && submittedEmail) body.email = submittedEmail;

      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as Order & { error?: string };
      if (!res.ok) {
        setCancelMsg(prev => ({ ...prev, [order.id]: data.error ?? 'Failed to cancel.' }));
      } else {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...data } : o));
        const msg = isPending ? 'Order cancelled.' : 'Cancellation requested. The admin will review it.';
        setCancelMsg(prev => ({ ...prev, [order.id]: msg }));
      }
    } catch {
      setCancelMsg(prev => ({ ...prev, [order.id]: 'Failed to cancel.' }));
    } finally {
      setCancellingId(null);
      setTimeout(() => setCancelMsg(prev => { const n = { ...prev }; delete n[order.id]; return n; }), 5000);
    }
  };

  const isSignedIn = sessionStatus === 'authenticated';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Your Orders</h1>
        {isSignedIn ? (
          <p className="text-gray-500 text-sm">Showing orders for <strong>{session?.user?.name ?? session?.user?.email}</strong></p>
        ) : (
          <p className="text-gray-500 text-sm">
            <Link href="/auth/signin" className="text-ghana-gold font-semibold hover:underline">Sign in</Link> to see your orders automatically, or enter your email below.
          </p>
        )}
      </div>

      {/* Guest email lookup (hidden when signed in) */}
      {!isSignedIn && (
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
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400">Loading orders…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">{error}</div>
      )}

      {searched && !loading && !error && orders.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-medium">No orders found.</p>
          <p className="text-sm mt-2">
            {isSignedIn
              ? "You haven't placed any orders yet."
              : <>No orders were placed with <strong>{submittedEmail}</strong>.</>
            }
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          {!isSignedIn && (
            <p className="text-gray-500 text-sm">Showing orders for <strong>{submittedEmail}</strong></p>
          )}
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
                  {order.cancellation_requested && order.delivery_status !== 'cancelled' && (
                    <span className="inline-flex items-center gap-1 border text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 border-orange-200 text-orange-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cancellation requested
                    </span>
                  )}
                  <span className="font-bold text-gray-900">${order.total_price.toFixed(2)}</span>
                  <InvoiceLink order={order} />
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

                {/* Cancel / Request Cancellation */}
                {(() => {
                  const s = order.delivery_status;
                  const canCancel = s === 'pending';
                  const canRequest = (s === 'processing' || s === 'shipped') && !order.cancellation_requested;
                  if (!canCancel && !canRequest) return null;
                  return (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 ${
                          canCancel
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                        }`}
                      >
                        {canCancel ? (
                          <><XCircle className="w-3.5 h-3.5" />{cancellingId === order.id ? 'Cancelling…' : 'Cancel Order'}</>
                        ) : (
                          <><AlertTriangle className="w-3.5 h-3.5" />{cancellingId === order.id ? 'Requesting…' : 'Request Cancellation'}</>
                        )}
                      </button>
                    </div>
                  );
                })()}
                {cancelMsg[order.id] && (
                  <p className={`mt-2 text-xs font-medium ${cancelMsg[order.id].startsWith('Order cancelled') || cancelMsg[order.id].startsWith('Cancellation requested') ? 'text-green-600' : 'text-red-600'}`}>
                    {cancelMsg[order.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
