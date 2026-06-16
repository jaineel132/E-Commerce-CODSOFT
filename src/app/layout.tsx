import type { Metadata } from "next";
import { Fraunces } from 'next/font/google';
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider initialUser={user}>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main>{children}</main>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
