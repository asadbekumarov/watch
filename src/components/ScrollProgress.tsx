"use client";

import React, { useEffect, useState } from "react";

interface Section {
  id: string;
  num: string;
  name: string;
}

const sections: Section[] = [
  { id: "hero", num: "01", name: "Genèse" },
  { id: "anatomy", num: "02", name: "Anatomie" },
  { id: "calibre", num: "03", name: "Calibre" },
  { id: "finissage", num: "04", name: "Finissage" },
];

export default function ScrollProgress() {
  const [activeNum, setActiveNum] = useState<string>("01");
  const [progressRatio, setProgressRatio] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? scrollY / docHeight : 0;
      setProgressRatio(Math.min(1, Math.max(0, ratio)));

      const viewportMiddle = scrollY + window.innerHeight * 0.45;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && viewportMiddle >= el.offsetTop) {
          setActiveNum(sections[i].num);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed right-6 md:right-8 lg:right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center pointer-events-none select-none"
    >
      {/* Current section number */}
      <span className="font-mono text-[13px] font-medium tracking-[0.1em] text-[#F5ECD5] mb-3 drop-shadow-md">
        {activeNum}
      </span>

      {/* Thin line rail */}
      <div className="relative w-[2px] h-28 bg-white/20">
        <div
          className="absolute top-0 left-0 w-full bg-[#D4AF37] transition-all duration-150"
          style={{ height: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Total count */}
      <span className="font-mono text-xs tracking-[0.1em] text-[#B5B5B5] mt-3">
        04
      </span>
    </div>
  );
}
