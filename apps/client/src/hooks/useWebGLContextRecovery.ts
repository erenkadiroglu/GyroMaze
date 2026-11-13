'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type * as THREE from 'three';
import {
  createContextLostHandler,
  createContextRestoredHandler,
  resolveNextCanvasRevision,
} from '@/utils/webGLRecoveryUtils';

/**
 * WebGL grafik bağlamı kesilme ve geri yükleme döngüsü yönetim kancası.
 */
export function useWebGLContextRecovery() {
  const contextCleanupRef = useRef<(() => void) | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);
  const [canvasRevision, setCanvasRevision] = useState(0);

  useEffect(() => {
    return () => {
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    };
  }, []);

  const handleSceneRetry = useCallback(() => {
    setIsContextLost(false);
    setCanvasRevision((prev) => resolveNextCanvasRevision(prev));
  }, []);

  const attachContextListeners = useCallback((gl: THREE.WebGLRenderer) => {
    contextCleanupRef.current?.();
    const dom = gl.domElement;
    if (!dom) return;

    const handleContextLost = createContextLostHandler(() => {
      setIsContextLost(true);
    });

    const handleContextRestored = createContextRestoredHandler(() => {
      setIsContextLost(false);
    });

    dom.addEventListener('webglcontextlost', handleContextLost);
    dom.addEventListener('webglcontextrestored', handleContextRestored);

    contextCleanupRef.current = () => {
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return {
    isContextLost,
    canvasRevision,
    handleSceneRetry,
    attachContextListeners,
  };
}
