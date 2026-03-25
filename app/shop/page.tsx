import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Our Jersey Collection</h1>
        <p className="text-gray-500 text-lg">Official Ghana Black Stars jerseys for the 2025 season</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
