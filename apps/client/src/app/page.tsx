/**
 * GyroMaze ana ekran başlangıç iskeleti.
 * Faz 2'de 3B WebGL sahnesi ve QR eşleşme arayüzü bu katmana entegre edilecektir.
 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_65%)]" />
      <div className="relative z-10 max-w-lg space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wider text-emerald-400 uppercase">
          Sistem Hazır • Faz 1
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          GyroMaze
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Çapraz cihaz 3B WebGL labirent motoru ve düşük gecikmeli telemetri
          altyapısı başlatılmaya hazır.
        </p>
      </div>
    </main>
  );
}
