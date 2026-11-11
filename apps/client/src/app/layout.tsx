import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GyroMaze | 3B Jiroskop Labirent Deneyimi',
  description:
    'Mobil cihazınızı jiroskop kontrolcüsü olarak kullanarak masaüstü ekranında oynayabileceğiniz sıfır gecikmeli 3B WebGL labirent oyunu.',
};

/**
 * GyroMaze kök yerleşim (layout) bileşeni.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}

