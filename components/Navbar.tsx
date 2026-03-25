'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Star, LogIn, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-black hover:text-ghana-gold transition-colors">
          <Star className="w-5 h-5 fill-ghana-gold text-ghana-gold" />
          Ghana Jersey Store
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-gray-700 font-medium hover:text-ghana-gold transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Cart + Auth + Hamburger */}
        <div className="flex items-center gap-2">
          {session?.user && (
            <Link
              href="/orders"
              className="hidden md:flex items-center gap-1 text-gray-700 font-medium hover:text-ghana-gold transition-colors px-2 py-2"
              title="My Orders"
            >
              <Package className="w-5 h-5" />
              <span className="text-sm">Orders</span>
            </Link>
          )}

          {session?.user ? (
            <div className="hidden md:flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200"
                />
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-sm text-gray-700 font-medium hover:text-red-500 transition-colors px-2 py-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="hidden md:flex items-center gap-1 text-sm text-gray-700 font-medium hover:text-ghana-gold transition-colors px-2 py-1 border border-gray-200 rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          )}

          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-800" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-ghana-gold text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          <ul className="flex flex-col gap-3">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-gray-700 font-medium hover:text-ghana-gold transition-colors py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {session?.user && (
              <li>
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-ghana-gold transition-colors py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  My Orders
                </Link>
              </li>
            )}
            <li className="border-t border-gray-100 pt-2">
              {session?.user ? (
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-red-500 font-medium hover:text-red-600 transition-colors py-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out ({session.user.name})
                </button>
              ) : (
                <button
                  onClick={() => { signIn('google'); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-ghana-gold transition-colors py-1"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
