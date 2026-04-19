'use client';

import { use } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { Product, CATEGORY_LABELS } from '@/lib/products';
import { useEffect } from 'react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((list: Product[]) => {
        const found = list.find(p => p.id === Number(id));
        setProduct(found ?? null);
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (product === undefined) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>;
  }
  if (product === null) notFound();

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="inline-block bg-ghana-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit mb-3">
            {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] ?? product.category}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-2">{product.team} · {product.league}</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Size Selector */}
          <div className="mb-6">
            <p className="font-semibold text-gray-800 mb-2">
              Select Size{' '}
              {!selectedSize && <span className="text-red-500 text-sm font-normal">(required)</span>}
            </p>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 border-2 rounded-lg font-bold transition-all ${
                    selectedSize === size
                      ? 'border-ghana-gold bg-ghana-gold text-black'
                      : 'border-gray-300 text-gray-700 hover:border-ghana-gold'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="font-semibold text-gray-800 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-lg font-bold text-lg transition-all ${
              added
                ? 'bg-ghana-green text-white'
                : selectedSize
                ? 'bg-black text-white hover:bg-ghana-gold hover:text-black'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
