export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  category: 'home' | 'away' | 'training';
}

export const products: Product[] = [
  {
    id: 1,
    name: "Ghana Home Jersey 2025",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    description: "The official Ghana home jersey for 2025. Featuring the iconic black star and traditional Kente-inspired design.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 2,
    name: "Ghana Away Jersey 2025",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
    description: "The official Ghana away jersey for 2025. Clean white design with gold accents.",
    sizes: ["S", "M", "L", "XL"],
    category: "away"
  },
  {
    id: 3,
    name: "Ghana Training Jersey 2025",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80",
    description: "Official Ghana training jersey. Lightweight and breathable for intense training sessions.",
    sizes: ["S", "M", "L", "XL"],
    category: "training"
  },
  {
    id: 4,
    name: "Ghana Goalkeeper Jersey 2025",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    description: "The official Ghana goalkeeper jersey. Designed for maximum comfort and visibility.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 5,
    name: "Ghana Limited Edition Jersey",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&q=80",
    description: "Limited edition Ghana jersey celebrating 50 years of football excellence.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 6,
    name: "Ghana Youth Jersey 2025",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80",
    description: "Official Ghana youth jersey. Perfect for young Black Stars fans.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  }
];
