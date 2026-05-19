import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dazzling UM Admin',
    template: '%s | Dazzling UM',
  },
  description: 'Dazzling UM — Premium ERP Web Admin Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
