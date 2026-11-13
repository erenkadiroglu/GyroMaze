import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GyroMaze | Telefonunla Yönettiğin 3B Labirent',
  description:
    'Telefonunu eğerek masaüstü ekranındaki 3B labirent tablasını yönettiğin, gecikmesiz çok oyunculu beceri oyunu.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'GyroMaze',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f1a2b' },
    { media: '(prefers-color-scheme: light)', color: '#e9eef5' },
  ],
};

/**
 * GyroMaze kök yerleşim (layout) bileşeni.
 * Yazı tiplerini ve varsayılan karanlık renk şemasını uygular.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scheme="dark"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-base font-sans text-fg antialiased selection:bg-brass/30">
        {children}
      </body>
    </html>
  );
}
