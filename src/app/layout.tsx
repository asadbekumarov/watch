import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { CartProvider } from "@/lib/cart";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vaqtsaroyi.uz"),
  title: "Vaqt Saroyi | Original Qo'l Soatlari Do'koni Toshkent",
  description:
    "Toshkentdagi original qo'l soatlari saloni. 2009 yildan buyon xizmatingizda. 24 oylik kafolat, quti va sertifikatlar, O'zbekiston bo'ylab yetkazib berish.",
  keywords: ["soatlar", "qo'l soatlari", "Toshkent soat do'koni", "original soatlar", "Vaqt Saroyi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${playfair.variable} ${inter.variable} scroll-smooth dark`}>
      <body className="bg-[#090909] text-[#EDEDED] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#090909] overflow-x-hidden min-h-screen">
        <I18nProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
