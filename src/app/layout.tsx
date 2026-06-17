import type { Metadata } from "next";
import { Fraunces } from 'next/font/google';
import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: "Verdant",
    template: "%s | Verdant",
  },
  description: "Discover thoughtfully curated products — from electronics and books to home essentials.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'Verdant',
    title: 'Verdant',
    description: 'Discover thoughtfully curated products — from electronics and books to home essentials.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verdant',
    description: 'Discover thoughtfully curated products — from electronics and books to home essentials.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Providers user={null}>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
