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
}

export default function ShopFilters({ groups, labels, activeCategory }: ShopFiltersProps) {
  const searchParams = useSearchParams();

  const buildUrl = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl('')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
            !activeCategory
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-700 border-gray-300 hover:border-ghana-gold hover:text-ghana-gold'
          }`}
        >
          All
        </Link>
        {groups.map(group => (
          <div key={group.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium hidden sm:block">{group.label}:</span>
            {group.categories.map(cat => (
              <Link
                key={cat}
                href={buildUrl(cat)}
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
