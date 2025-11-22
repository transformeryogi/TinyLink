import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten URLs, track clicks, and manage your links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              🔗 TinyLink
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-8rem)]">
          {children}
        </main>
        <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
            <p>TinyLink © 2025 - URL Shortener</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
