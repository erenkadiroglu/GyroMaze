'use client';

import { useRef } from 'react';
import { useCelebrationCanvas } from '@/hooks/useCelebrationCanvas';

interface CelebrationCanvasProps {
  active: boolean;
}

export function CelebrationCanvas({ active }: CelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useCelebrationCanvas(active, canvasRef);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}
