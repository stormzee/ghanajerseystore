import Link from 'next/link';
import { getPool, ensureSchema } from '@/lib/db';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    await ensureSchema();
    const result = await getPool().query('SELECT * FROM products ORDER BY id ASC LIMIT 3');
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

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-[#111] to-ghana-green text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-ghana-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-ghana-green blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-ghana-gold text-black text-sm font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-wider">
            Official Preorder 2025
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Wear the{' '}
            <span className="text-ghana-gold">Black Stars</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Preorder your official Ghana football jersey and show your support for the Black Stars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-ghana-gold text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Featured Jerseys</h2>
          <p className="text-gray-500">The most popular picks from our 2025 collection</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-block bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors"
          >
            View All Jerseys →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ghana-green text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Be Part of the Movement</h2>
          <p className="text-green-100 text-lg mb-8 leading-relaxed">
            Preorder your Ghana jersey today and join thousands of fans worldwide who proudly wear the Black Stars.
            All jerseys ship after the official release date.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-2xl font-bold text-ghana-gold">Free</div>
              <div className="text-sm text-green-100">Shipping nationwide</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-2xl font-bold text-ghana-gold">100%</div>
              <div className="text-sm text-green-100">Authentic jerseys</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-2xl font-bold text-ghana-gold">2025</div>
              <div className="text-sm text-green-100">Official collection</div>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-block mt-8 bg-ghana-gold text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Preorder Now
          </Link>
        </div>
      </section>
    </>
  );
}
