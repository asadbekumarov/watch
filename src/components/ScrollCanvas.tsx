'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

interface ScrollCanvasProps {
  frameCount?: number;
  folderPath?: string;
}

export default function ScrollCanvas({ frameCount = 239, folderPath = '/frames' }: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef({ frame: 0 });
  const lastRenderedIndexRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = (rawIndex: number) => {
      const targetIndex = Math.min(frameCount - 1, Math.max(0, Math.round(rawIndex)));
      let img = imagesRef.current[targetIndex];

      // Agar kadr hali yuklanmagan bo'lsa, oxirgi muvaffaqiyatli yuklangan kadrni chizish
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = imagesRef.current[lastRenderedIndexRef.current];
      } else {
        lastRenderedIndexRef.current = targetIndex;
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Cover-fit
      const hRatio = w / img.width;
      const vRatio = h / img.height;
      const ratio = Math.max(hRatio, vRatio);

      let cx = (w - img.width * ratio) / 2;
      let cy = (h - img.height * ratio) / 2;

      // Smart Adaptive Focal Point Math:
      // In early frames (Hero section), the 3D watch model is positioned on the right half (X ~ 1448).
      // On narrow / mobile screens (w < 1024), standard cover pushes the watch off-screen to the right.
      // We adjust cx on mobile so the watch stays centered and properly framed in the viewport.
      if (w < 1024) {
        const watchScaledX = 1448.5 * ratio;
        const targetScreenX = w < 640 ? w * 0.5 : w * 0.55;
        const offsetShift = targetScreenX - (cx + watchScaledX);
        const shiftFactor = Math.max(0, 1 - targetIndex / 85);
        cx += offsetShift * shiftFactor;

        // On portrait mobile screens, subtly lift the watch higher during hero so text below has room
        if (h > w && targetIndex < 65) {
          const verticalLift = -h * 0.08 * (1 - targetIndex / 65);
          cy += verticalLift;
        }
      }

      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
    };

    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(frameIndexRef.current.frame);
    };

    // Preload & setup frames
    const images: HTMLImageElement[] = new Array(frameCount);
    imagesRef.current = images;

    const firstImg = new Image();
    images[0] = firstImg;

    const onFirstLoad = () => {
      updateCanvasSize();
      render(0);
    };

    firstImg.onload = onFirstLoad;
    firstImg.src = `${folderPath}/frame_0001.webp`;

    if (firstImg.complete && firstImg.naturalWidth > 0) {
      onFirstLoad();
    }

    // Progressive Chunked Preload: loads frames in non-blocking micro-batches
    let currentPreloadIndex = 2;
    let cancelPreload = false;
    const chunkSize = 6;

    const loadNextBatch = () => {
      if (cancelPreload || currentPreloadIndex > frameCount) return;
      const end = Math.min(currentPreloadIndex + chunkSize, frameCount + 1);
      for (let i = currentPreloadIndex; i < end; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(4, '0');
        img.src = `${folderPath}/frame_${frameNum}.webp`;
        images[i - 1] = img;
      }
      currentPreloadIndex = end;
      if (currentPreloadIndex <= frameCount) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 20);
        }
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(loadNextBatch);
    } else {
      setTimeout(loadNextBatch, 40);
    }

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // GSAP ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    });

    tl.to(frameIndexRef.current, {
      frame: frameCount - 1,
      ease: 'none',
      onUpdate: () => {
        render(frameIndexRef.current.frame);
      },
    });

    return () => {
      cancelPreload = true;
      window.removeEventListener('resize', updateCanvasSize);
      tl.kill();
    };
  }, [frameCount, folderPath]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Chap tomondagi nafis gradient (faqat desktopda chap tomondagi matn o'qilishini ta'minlash uchun) */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#090909]/95 via-[#090909]/45 to-transparent w-[55%] pointer-events-none" />

      {/* Mobil va planshet uchun yumshoq vertikal va radial vinetka */}
      <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-[#090909]/85 via-transparent to-[#090909]/90 pointer-events-none" />
      <div className="block lg:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#090909_100%)] opacity-40 pointer-events-none" />

      {/* Pastki o'tish gradienti */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent pointer-events-none" />
    </div>
  );
}
