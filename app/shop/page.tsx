import { getPool, ensureSchema } from '@/lib/db';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Product[]> {
  try {
    await ensureSchema();
    const result = await getPool().query('SELECT * FROM products ORDER BY id ASC');
    return result.rows.map(r => {
      let sizes: string[] = ['S', 'M', 'L', 'XL'];
      try {
        sizes = Array.isArray(r.sizes) ? r.sizes : JSON.parse(r.sizes);
      } catch {
        // keep default sizes if parsing fails
      }
      return { ...r, sizes };
    });
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
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
