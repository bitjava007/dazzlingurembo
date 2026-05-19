import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dazzling UM',
    template: '%s | Dazzling UM',
  },
  description:
    'Dazzling UM — a modern, full-stack application built with Next.js, NestJS, and Prisma.',
  keywords: ['dazzlingurembo', 'nextjs', 'nestjs', 'typescript', 'fullstack'],
  authors: [{ name: 'Dazzling UM Team' }],
  creator: 'Dazzling UM',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dazzlingurembo.com',
    title: 'Dazzling UM',
    description: 'Dazzling UM — a modern full-stack application.',
    siteName: 'Dazzling UM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dazzling UM',
    description: 'Dazzling UM — a modern full-stack application.',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
