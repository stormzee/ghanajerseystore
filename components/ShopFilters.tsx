'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProductCategory } from '@/lib/products';

interface CategoryGroup {
  label: string;
  categories: ProductCategory[];
}

interface ShopFiltersProps {
  groups: CategoryGroup[];
  labels: Record<string, string>;
  activeCategory: string;
  activeLeague: string;
  activeTeam: string;
  query: string;
  leagues: string[];
  teams: string[];
}

export default function ShopFilters({
  groups,
  labels,
  activeCategory,
  activeLeague,
  activeTeam,
  query,
  leagues,
  teams,
}: ShopFiltersProps) {
  const searchParams = useSearchParams();

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="mb-8 space-y-4">
      <form method="GET" action="/shop" className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="hidden" name="category" value={activeCategory} />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by club or jersey..."
          className="md:col-span-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ghana-gold"
        />
        <select
          name="league"
          defaultValue={activeLeague}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ghana-gold"
        >
          <option value="">All leagues</option>
          {leagues.map(league => <option key={league} value={league}>{league}</option>)}
        </select>
        <select
          name="team"
          defaultValue={activeTeam}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ghana-gold"
        >
          <option value="">All clubs</option>
          {teams.map(team => <option key={team} value={team}>{team}</option>)}
        </select>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ category: '' })}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
            !activeCategory
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-700 border-gray-300 hover:border-ghana-gold hover:text-ghana-gold'
          }`}
        >
          All types
        </Link>
        {groups.map(group => (
          <div key={group.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium hidden sm:block">{group.label}:</span>
            {group.categories.map(cat => (
              <Link
                key={cat}
                href={buildUrl({ category: cat })}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  activeCategory === cat
                    ? 'bg-ghana-gold text-black border-ghana-gold'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-ghana-gold hover:text-ghana-gold'
                }`}
              >
                {labels[cat] ?? cat}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
