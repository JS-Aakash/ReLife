import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReLifeProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ReLife - The Living Digital Passport for Every Product',
  description:
    'A futuristic product-lifecycle platform that gives every physical product a permanent digital identity, preserving ownership, warranty, maintenance, and repair history.',
  keywords: [
    'Digital Product Passport',
    'Right to Repair',
    'E-Waste Avoidance',
    'Product Health Score',
    'Smart Resale',
    'Warranty Tracker',
  ],
  authors: [{ name: 'ReLife Platform Team' }],
  openGraph: {
    title: 'ReLife - The Living Digital Passport for Every Product',
    description:
      'Turn disposable products into repairable heirlooms with verifiable lifetime provenance, QR passports, and AI diagnostic copilot.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FBFBF9] text-[#1C2120]">
        <ReLifeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ReLifeProvider>
      </body>
    </html>
  );
}
