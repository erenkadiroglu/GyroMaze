import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-4 text-center">
      <h1 className="text-4xl font-extrabold text-fg">404</h1>
      <p className="mt-2 text-sm text-muted">
        Aradığınız labirent sayfası bulunamadı.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-brass px-4 py-2 text-xs font-semibold text-surface-2 shadow-sm transition-transform hover:scale-105"
      >
        Ana Ekrana Dön
      </Link>
    </main>
  );
}

