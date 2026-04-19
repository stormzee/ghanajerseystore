'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { PAYMENT_METHODS, PaymentMethod } from '@/lib/payments';

const LOCATIONS = ['Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Takoradi', 'Other'];

interface OrderForm {
  customer_name: string;
  phone: string;
  email: string;
  location: string;
  notes: string;
  payment_method: PaymentMethod;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<OrderForm>({
    customer_name: '',
    phone: '',
    email: '',
    location: 'Accra',
    notes: '',
    payment_method: PAYMENT_METHODS.CASH,
  });

  // Auto-fill name and email from Google session; clear form if the signed-in user changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      customer_name: session?.user?.name || '',
      email: session?.user?.email || '',
    }));
  }, [session?.user?.email, session?.user?.name]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let paymentReference: string | null = null;
      let paymentStatus = 'pending';
      if (form.payment_method === PAYMENT_METHODS.MOMO) {
        const momoRes = await fetch('/api/payments/momo/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            currency: 'GHS',
            phoneNumber: form.phone,
            externalId: `jerseyvault-${Date.now()}`,
            payerMessage: 'jerseyvault order payment',
            payeeNote: 'Jersey purchase',
          }),
        });
        const momoData = await momoRes.json() as { referenceId?: string; error?: string };
        if (!momoRes.ok) throw new Error(momoData.error ?? 'MoMo request failed');
        paymentReference = momoData.referenceId ?? null;
        paymentStatus = 'requested';
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            size: i.size,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total_price: totalPrice,
          payment_provider: form.payment_method === PAYMENT_METHODS.MOMO ? 'mtn-momo-collections' : null,
          payment_reference: paymentReference,
          payment_status: paymentStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      setSubmitted(true);
      clearCart();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Order Received!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Your order has been received. We will contact you shortly with confirmation details.
        </p>
        <Link
          href="/shop"
          className="bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Add some jerseys to get started.</p>
        <Link
          href="/shop"
          className="bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors inline-block"
        >
          Browse Jerseys
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div
              key={`${item.product.id}-${item.size}`}
              className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Size: {item.size}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                    className="w-8 h-8 border border-gray-300 rounded-md font-bold hover:bg-gray-100 transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-md font-bold hover:bg-gray-100 transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.product.id, item.size)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({totalItems})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-ghana-green font-semibold">Free</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors"
              >
                Continue to Checkout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Checkout Form */}
      {showForm && (
        <div className="mt-10 bg-white border border-gray-200 rounded-xl p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                required
                value={form.customer_name}
                onChange={handleFormChange}
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleFormChange}
                placeholder="+233 XX XXX XXXX"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                required
                value={form.location}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold bg-white"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                rows={3}
                placeholder="Any special requests or delivery notes..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_method"
                required
                value={form.payment_method}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold bg-white"
              >
                <option value={PAYMENT_METHODS.CASH}>Cash on Delivery</option>
                <option value={PAYMENT_METHODS.MOMO}>MTN MoMo (Collections API)</option>
              </select>
              {form.payment_method === PAYMENT_METHODS.MOMO && (
                <p className="mt-1 text-xs text-gray-500">
                  You will receive an MTN MoMo prompt on your phone to approve payment. If you do not approve,
                  the order stays pending and you can retry checkout.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white font-bold py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors disabled:opacity-50"
              >
                  {loading ? 'Placing Order…' : 'Confirm Order'}
                </button>
              </div>
            </form>
        </div>
      )}
    </div>
  );
}
