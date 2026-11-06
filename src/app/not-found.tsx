import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] flex items-center justify-center bg-[#090909] px-4 pt-28 pb-16">
        <div className="max-w-md w-full text-center space-y-6 bg-[#141210] border border-[#D4AF37]/20 rounded-2xl p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="font-mono text-sm tracking-[0.2em] text-[#D4AF37] uppercase font-semibold">
            404 // SAHIFA TOPILMADI
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EB] font-light">
            Soat topilmadi
          </h1>
          <p className="text-sm text-[#9E9589] font-normal leading-relaxed">
            Siz qidirayotgan sahifa yoki model mavjud emas yoki boshqa manzilga ko&apos;chirilgan bo&apos;lishi mumkin.
          </p>
          <div className="pt-2">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center min-h-[48px] px-8 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.3)]"
            >
              Katalogga qaytish
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

