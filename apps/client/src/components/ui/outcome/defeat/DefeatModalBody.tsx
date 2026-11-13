'use client';

interface DefeatModalBodyProps {
  crystalSummary: string;
}

export function DefeatModalBody({ crystalSummary }: DefeatModalBodyProps) {
  return (
    <p className="text-xs leading-relaxed text-muted">
      Toplanan kristal:{' '}
      <strong className="gm-num font-semibold text-fg">
        {crystalSummary}
      </strong>
      . Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.
    </p>
  );
}

