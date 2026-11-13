import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import {
  getAppMetadataTitle,
  getAppMetadataDescription,
  getViewportThemeColors,
  resolveHtmlAttributes,
  resolveRootBodyClasses,
} from '@/utils/layoutMetadataUtils';

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
  title: getAppMetadataTitle(),
  description: getAppMetadataDescription(),
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
  themeColor: getViewportThemeColors(),
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
  const htmlAttrs = resolveHtmlAttributes('dark');

  return (
    <html
      lang={htmlAttrs.lang}
      data-scheme={htmlAttrs['data-scheme']}
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning={htmlAttrs.suppressHydrationWarning}
    >
      <body className={resolveRootBodyClasses()}>{children}</body>
    </html>
  );
}
