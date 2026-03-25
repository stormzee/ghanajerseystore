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
}

// Static product list used to seed the database on first run.
export const staticProducts: Product[] = [
  {
    id: 1,
    name: "Ghana Home Jersey 2025",
    price: 89.99,
    image: "/jerseys/home-jersey.svg",
    description: "The official Ghana home jersey for 2025. Featuring the iconic black star and traditional Kente-inspired design.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-home",
  },
  {
    id: 2,
    name: "Ghana Away Jersey 2025",
    price: 89.99,
    image: "/jerseys/away-jersey.svg",
    description: "The official Ghana away jersey for 2025. Clean white design with gold accents.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-away",
  },
  {
    id: 3,
    name: "Ghana Training Jersey 2025",
    price: 59.99,
    image: "/jerseys/training-jersey.svg",
    description: "Official Ghana training jersey. Lightweight and breathable for intense training sessions.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-training",
  },
  {
    id: 4,
    name: "Ghana Goalkeeper Jersey 2025",
    price: 79.99,
    image: "/jerseys/goalkeeper-jersey.svg",
    description: "The official Ghana goalkeeper jersey. Designed for maximum comfort and visibility.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-goalkeeper",
  },
  {
    id: 5,
    name: "Ghana Limited Edition Jersey",
    price: 119.99,
    image: "/jerseys/limited-jersey.svg",
    description: "Limited edition Ghana jersey celebrating 50 years of football excellence.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-home",
  },
  {
    id: 6,
    name: "Ghana Youth Jersey 2025",
    price: 49.99,
    image: "/jerseys/youth-jersey.svg",
    description: "Official Ghana youth jersey. Perfect for young Black Stars fans.",
    sizes: ["S", "M", "L", "XL"],
    category: "jersey-home",
  },
  {
    id: 7,
    name: "Black Stars Graphic T-Shirt",
    price: 34.99,
    image: "/jerseys/home-jersey.svg",
    description: "Casual Black Stars graphic tee. Show your Ghana pride every day.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "t-shirt",
  },
  {
    id: 8,
    name: "Ghana Football Hoodie",
    price: 64.99,
    image: "/jerseys/training-jersey.svg",
    description: "Comfortable Ghana football hoodie. Perfect for chilly matchdays.",
    sizes: ["S", "M", "L", "XL"],
    category: "hoodie",
  },
  {
    id: 9,
    name: "Ghana Training Shorts",
    price: 39.99,
    image: "/jerseys/training-jersey.svg",
    description: "Lightweight training shorts with the Ghana crest. Breathable fabric for active use.",
    sizes: ["S", "M", "L", "XL"],
    category: "shorts",
  },
  {
    id: 10,
    name: "Black Stars Polo Shirt",
    price: 44.99,
    image: "/jerseys/home-jersey.svg",
    description: "Smart casual polo featuring the Black Stars emblem. Great for everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    category: "polo",
  },
  {
    id: 11,
    name: "Ghana Scarf",
    price: 19.99,
    image: "/jerseys/home-jersey.svg",
    description: "Official Ghana football scarf in the national colours. Perfect for matchday.",
    sizes: ["One Size"],
    category: "accessories",
  },
  {
    id: 12,
    name: "Ghana Snapback Cap",
    price: 24.99,
    image: "/jerseys/home-jersey.svg",
    description: "Stylish snapback cap embroidered with the Ghana Black Stars crest.",
    sizes: ["One Size"],
    category: "accessories",
  },
];

// Keep the old export name so existing client-side pages still compile during transition.
export const products = staticProducts;
