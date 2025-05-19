// /app/layout.tsx

import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartCRM by dwellr.ai',
  description: 'AI-powered CRM for modular & manufactured home sales.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/dwellr-logo.svg"
              alt="dwellr.ai logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-semibold text-green-600">dwellr.ai</span>
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link href="/call" className="text-gray-600 hover:text-green-600">Call</Link>
            <Link href="/leads" className="text-gray-600 hover:text-green-600">Leads</Link>
            <Link href="/calendar" className="text-gray-600 hover:text-green-600">Calendar</Link>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
