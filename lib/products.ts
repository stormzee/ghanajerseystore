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
    image: "/jerseys/home-jersey.svg",
    description: "The official Ghana home jersey for 2025. Featuring the iconic black star and traditional Kente-inspired design.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 2,
    name: "Ghana Away Jersey 2025",
    price: 89.99,
    image: "/jerseys/away-jersey.svg",
    description: "The official Ghana away jersey for 2025. Clean white design with gold accents.",
    sizes: ["S", "M", "L", "XL"],
    category: "away"
  },
  {
    id: 3,
    name: "Ghana Training Jersey 2025",
    price: 59.99,
    image: "/jerseys/training-jersey.svg",
    description: "Official Ghana training jersey. Lightweight and breathable for intense training sessions.",
    sizes: ["S", "M", "L", "XL"],
    category: "training"
  },
  {
    id: 4,
    name: "Ghana Goalkeeper Jersey 2025",
    price: 79.99,
    image: "/jerseys/goalkeeper-jersey.svg",
    description: "The official Ghana goalkeeper jersey. Designed for maximum comfort and visibility.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 5,
    name: "Ghana Limited Edition Jersey",
    price: 119.99,
    image: "/jerseys/limited-jersey.svg",
    description: "Limited edition Ghana jersey celebrating 50 years of football excellence.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  },
  {
    id: 6,
    name: "Ghana Youth Jersey 2025",
    price: 49.99,
    image: "/jerseys/youth-jersey.svg",
    description: "Official Ghana youth jersey. Perfect for young Black Stars fans.",
    sizes: ["S", "M", "L", "XL"],
    category: "home"
  }
];
