import { getPool, ensureSchema } from '@/lib/db';
import { Product, CATEGORY_LABELS, CATEGORY_GROUPS } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import ShopFilters from '@/components/ShopFilters';
import { TOP_LEAGUES } from '@/lib/teams';

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

interface ShopPageProps {
  searchParams: Promise<{ category?: string; league?: string; team?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, league, team, q } = await searchParams;
  const allProducts = await getProducts();
  const normalizedQuery = (q ?? '').trim().toLowerCase();

  const teams = Array.from(
    new Set(
      allProducts
        .filter(p => !league || p.league === league)
        .map(p => p.team)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filtered = allProducts.filter(p => {
    if (category && p.category !== category) return false;
    if (league && p.league !== league) return false;
    if (team && p.team !== team) return false;
    if (normalizedQuery) {
      const haystack = `${p.name} ${p.description} ${p.team} ${p.league}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Shop</h1>
        <p className="text-gray-500 text-lg">Browse jerseys, sportswear, and fan gear from top clubs across Europe.</p>
      </div>

      <ShopFilters
        groups={CATEGORY_GROUPS}
        labels={CATEGORY_LABELS}
        activeCategory={category ?? ''}
        activeLeague={league ?? ''}
        activeTeam={team ?? ''}
        query={q ?? ''}
        leagues={TOP_LEAGUES}
        teams={teams}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl font-medium">No products match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
