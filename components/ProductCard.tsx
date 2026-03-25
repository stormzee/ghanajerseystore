import Image from 'next/image';
import Link from 'next/link';
import { Product, CATEGORY_LABELS } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const label = CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] ?? product.category;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-2 left-2 bg-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm text-ghana-green uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-ghana-gold transition-colors leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-gray-900">${product.price.toFixed(2)}</span>
            <span className="bg-black text-white text-sm px-4 py-1.5 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors font-medium">
              Order
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
