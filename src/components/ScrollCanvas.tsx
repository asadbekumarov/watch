'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
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

      // Agar kadr hali yuklanmagan bo'lsa, oxirgi muvaffaqiyatli kadrni ko'rsatish
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

      const cx = (w - img.width * ratio) / 2;
      const cy = (h - img.height * ratio) / 2;

      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
    };

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(frameIndexRef.current.frame);
    };

    // Kadrlarni bosqichma-bosqich yuklash
    const images: HTMLImageElement[] = new Array(frameCount);

    const firstImg = new Image();
    const firstFrameString = '0001';
    firstImg.src = `${folderPath}/frame_${firstFrameString}.webp`;
    firstImg.onload = () => {
      images[0] = firstImg;
      render(0);
    };
    images[0] = firstImg;

    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, '0');
      img.src = `${folderPath}/frame_${frameNum}.webp`;
      images[i - 1] = img;
    }
    imagesRef.current = images;

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
      window.removeEventListener('resize', updateCanvasSize);
      tl.kill();
    };
  }, [frameCount, folderPath]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Chap tomondagi gradient (Hero va umumiy o'qilish uchun) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/95 via-[#090909]/60 to-transparent w-full md:w-[65%] lg:w-[50%] pointer-events-none" />

      {/* Markaziy yumshoq vignetting overlay (Matnlar markazga o'tganda soat va matn uyg'un bo'lishi uchun) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,9,9,0.3)_0%,rgba(9,9,9,0.75)_85%,#090909_100%)] pointer-events-none" />

      {/* Pastki o'tish gradienti */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent pointer-events-none" />
    </div>
  );
}
