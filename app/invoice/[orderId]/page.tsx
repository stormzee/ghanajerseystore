'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Printer, Download } from 'lucide-react';

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

export default function InvoicePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const url = `/api/orders/invoice?orderId=${orderId}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load invoice.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Failed to load invoice.');
    } finally {
      setLoading(false);
    }
  }, [orderId, emailParam]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading invoice…</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-500 text-lg font-medium">{error || 'Invoice not found.'}</p>
        <Link href="/orders" className="text-ghana-gold hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const invoiceDate = new Date(order.created_at);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Actions toolbar (hidden when printing) */}
      <div className="print:hidden max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-ghana-gold transition-colors">
          ← Back to Orders
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-black text-white font-semibold px-4 py-2 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Invoice card */}
      <div id="invoice" className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="bg-black text-white px-8 py-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 fill-ghana-gold text-ghana-gold" />
              <span className="font-extrabold text-lg text-ghana-gold">adumpzkanta.store</span>
            </div>
            <p className="text-gray-400 text-xs">Your official Ghana wear destination</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-extrabold text-white">INVOICE</h1>
            <p className="text-gray-400 text-sm mt-1">#{String(order.id).padStart(6, '0')}</p>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bill to</p>
              <p className="font-bold text-gray-900">{order.customer_name}</p>
              {order.email && <p className="text-gray-600 text-sm">{order.email}</p>}
              <p className="text-gray-600 text-sm">{order.phone}</p>
              <p className="text-gray-600 text-sm">{order.location}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Invoice date</p>
                <p className="text-gray-800 font-medium">
                  {invoiceDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
                <span className="inline-block capitalize bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {order.delivery_status}
                </span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Item</th>
                <th className="text-center px-4 py-2.5 font-semibold text-gray-600">Size</th>
                <th className="text-center px-4 py-2.5 font-semibold text-gray-600">Qty</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Unit Price</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.size}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-ghana-green font-semibold">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900 text-base">
                <span>Total</span>
                <span>${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Order Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 text-center">
          <p className="text-xs text-gray-400">
            Thank you for your order! For any questions, contact us at{' '}
            <a href="mailto:hello@adumpzkanta.store" className="text-ghana-gold hover:underline">
              hello@adumpzkanta.store
            </a>
          </p>
          <p className="text-xs text-gray-300 mt-1">© {new Date().getFullYear()} adumpzkanta.store</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
