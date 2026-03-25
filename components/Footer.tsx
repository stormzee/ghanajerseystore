import Link from 'next/link';
import { Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-ghana-gold font-bold text-lg mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 fill-ghana-gold text-ghana-gold" />
            adumpzkanta.store
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your official destination for Ghana Black Stars jerseys and sportswear. Support the national team with authentic gear.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-ghana-gold font-bold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/orders', label: 'My Orders' },
              { href: '/cart', label: 'Cart' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ghana-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-ghana-gold font-bold text-lg mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📍 Accra, Ghana</li>
            <li>📞 +233 20 000 0000</li>
            <li>✉️ hello@adumpzkanta.store</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} adumpzkanta.store. All rights reserved. | Go Black Stars! 🌟
      </div>
    </footer>
  );
}
