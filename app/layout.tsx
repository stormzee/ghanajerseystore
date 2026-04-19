import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTracker from '@/components/PageTracker';

export const metadata: Metadata = {
  title: 'jerseyvault.com | Jerseys & Fan Gear',
  description: 'Shop football jerseys, sportswear, and fan accessories from top clubs across Europe at jerseyvault.com.',
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
            <PageTracker />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
