export type ProductCategory =
  | 'jersey-home'
  | 'jersey-away'
  | 'jersey-training'
  | 'jersey-goalkeeper'
  | 't-shirt'
  | 'hoodie'
  | 'shorts'
  | 'polo'
  | 'accessories';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'jersey-home': 'Home Jersey',
  'jersey-away': 'Away Jersey',
  'jersey-training': 'Training Jersey',
  'jersey-goalkeeper': 'Goalkeeper Jersey',
  't-shirt': 'T-Shirt',
  'hoodie': 'Hoodie',
  'shorts': 'Shorts',
  'polo': 'Polo Shirt',
  'accessories': 'Accessories',
};

export const CATEGORY_GROUPS: { label: string; categories: ProductCategory[] }[] = [
  { label: 'Jerseys', categories: ['jersey-home', 'jersey-away', 'jersey-training', 'jersey-goalkeeper'] },
  { label: 'Casual Wear', categories: ['t-shirt', 'hoodie', 'polo'] },
  { label: 'Bottoms & Accessories', categories: ['shorts', 'accessories'] },
];

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  category: string;
  league: string;
  team: string;
}

// Static product list used to seed the database on first run.
export const staticProducts: Product[] = [
  {
    id: 1,
    name: 'Arsenal Home Jersey 2025/26',
    price: 89.99,
    image: '/jerseys/home-jersey.svg',
    description: 'Official Arsenal home jersey for the 2025/26 campaign.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'jersey-home',
    league: 'England',
    team: 'Arsenal',
  },
  {
    id: 2,
    name: 'Real Madrid Away Jersey 2025/26',
    price: 89.99,
    image: '/jerseys/away-jersey.svg',
    description: 'Premium Real Madrid away jersey with lightweight match fabric.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'jersey-away',
    league: 'Spain',
    team: 'Real Madrid',
  },
  {
    id: 3,
    name: 'AC Milan Training Jersey',
    price: 59.99,
    image: '/jerseys/training-jersey.svg',
    description: 'Breathable training top inspired by AC Milan training kits.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'jersey-training',
    league: 'Italy',
    team: 'AC Milan',
  },
  {
    id: 4,
    name: 'Bayern Munich Goalkeeper Jersey',
    price: 79.99,
    image: '/jerseys/goalkeeper-jersey.svg',
    description: 'High-visibility goalkeeper jersey style worn by Bayern keepers.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'jersey-goalkeeper',
    league: 'Germany',
    team: 'Bayern Munich',
  },
  {
    id: 5,
    name: 'PSG Limited Edition Jersey',
    price: 119.99,
    image: '/jerseys/limited-jersey.svg',
    description: 'Limited edition PSG jersey for collectors and loyal fans.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'jersey-home',
    league: 'France',
    team: 'Paris Saint-Germain',
  },
  {
    id: 6,
    name: 'Ajax Youth Jersey 2025',
    price: 49.99,
    image: '/jerseys/youth-jersey.svg',
    description: 'Youth-sized Ajax jersey made for young supporters.',
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'jersey-home',
    league: 'Netherlands',
    team: 'Ajax',
  },
  {
    id: 7,
    name: 'Benfica Graphic T-Shirt',
    price: 34.99,
    image: '/jerseys/home-jersey.svg',
    description: 'Casual Benfica supporter t-shirt for everyday wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    category: 't-shirt',
    league: 'Portugal',
    team: 'Benfica',
  },
  {
    id: 8,
    name: 'Galatasaray Fan Hoodie',
    price: 64.99,
    image: '/jerseys/training-jersey.svg',
    description: 'Warm fan hoodie inspired by Galatasaray colors.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'hoodie',
    league: 'Turkey',
    team: 'Galatasaray',
  },
  {
    id: 9,
    name: 'Barcelona Training Shorts',
    price: 39.99,
    image: '/jerseys/training-jersey.svg',
    description: 'Lightweight Barcelona-inspired shorts for drills and workouts.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'shorts',
    league: 'Spain',
    team: 'Barcelona',
  },
  {
    id: 10,
    name: 'Manchester City Polo Shirt',
    price: 44.99,
    image: '/jerseys/home-jersey.svg',
    description: 'Smart casual Manchester City polo for matchdays or office wear.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'polo',
    league: 'England',
    team: 'Manchester City',
  },
  {
    id: 11,
    name: 'Juventus Matchday Scarf',
    price: 19.99,
    image: '/jerseys/home-jersey.svg',
    description: 'Classic Juventus scarf to complete your matchday outfit.',
    sizes: ['One Size'],
    category: 'accessories',
    league: 'Italy',
    team: 'Juventus',
  },
  {
    id: 12,
    name: 'Fenerbahce Snapback Cap',
    price: 24.99,
    image: '/jerseys/home-jersey.svg',
    description: 'Structured snapback cap inspired by Fenerbahce club colors.',
    sizes: ['One Size'],
    category: 'accessories',
    league: 'Turkey',
    team: 'Fenerbahce',
  },
];

// Keep the old export name so existing client-side pages still compile during transition.
export const products = staticProducts;
