import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { CollectionsShowcase } from './components/CollectionsShowcase';
import { Heritage } from './components/Heritage';
import { Craftsmanship } from './components/Craftsmanship';
import { Gallery } from './components/Gallery';
import { Contact } from './components/Contact';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll with exact parameters
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // 2. Synchronize Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 3. Register Lenis into GSAP ticker to prevent jitter
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Initial ScrollTrigger refresh once DOM is parsed
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(refreshTimeout);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-[#020617] text-white selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
        {/* Fixed Luxury Navigation */}
        <Navbar onNavigate={handleNavigate} />

        {/* Main Single Page Content */}
        <main className="relative w-full">
          {/* Section 1: Hero / Home */}
          <Home />

          {/* Section 2: Collections Showcase */}
          <CollectionsShowcase />

          {/* Section 3: Heritage */}
          <Heritage />

          {/* Section 4: Craftsmanship */}
          <Craftsmanship />

          {/* Section 5: Gallery */}
          <Gallery />

          {/* Section 6: Contact & Footer */}
          <Contact />
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
