import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] flex items-center justify-center bg-[#090909] px-4 pt-28 pb-16">
        <div className="max-w-md w-full text-center space-y-6 bg-[#0e0e0e] border border-white/20 p-8 sm:p-12">
          <div className="font-mono text-sm tracking-[0.2em] text-[#D4AF37] uppercase">
            404 // SAHIFA TOPILMADI
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5ECD5] font-light">
            Soat topilmadi
          </h1>
          <p className="text-sm text-[#A8A8A8] font-normal leading-relaxed">
            Siz qidirayotgan sahifa yoki model mavjud emas yoki boshqa manzilga ko&apos;chirilgan bo&apos;lishi mumkin.
          </p>
          <div className="pt-2">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center min-h-[48px] px-8 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
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

