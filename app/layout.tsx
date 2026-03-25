import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ghana Jersey Store | Official Preorder',
  description: 'Preorder official Ghana football jerseys. Support the Black Stars with authentic 2025 jerseys.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
