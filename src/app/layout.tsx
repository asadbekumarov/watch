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
  metadataBase: new URL("https://alfajr.uz"),
  title: "ALFAJR — Soatlar Olami | Islomiy Azon Soatlari & Tsar Bomba Toshkent",
  description:
    "O'zbekistondagi 100% asl Al-Fajr azon va qibla soatlari, Tsar Bomba tonneau va Philipp Plein modellari. O'zbekiston bo'ylab BTS Pochta orqali BEPUL yetkazib berish va @soatsoz_uzb rasmiy servis kafolati.",
  keywords: [
    "Al-Fajr soatlari",
    "azon soati",
    "Al Fajr Toshkent",
    "qibla kompas soat",
    "Tsar Bomba Tashkent",
    "Philipp Plein soat",
    "soatlar olami",
    "soat dostavka",
    "BTS pochta bepul dastavka",
    "alfajr_uz",
  ],
  openGraph: {
    title: "ALFAJR — Soatlar Olami | Rasmiy Do'kon",
    description: "Al-Fajr Islomiy azon soatlari, Tsar Bomba va xalqaro brendlar. BTS Express orqali bepul yetkazish.",
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${playfair.variable} ${inter.variable} scroll-smooth dark`}>
      <body className="bg-[#090909] text-[#F8F8F8] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#090909] overflow-x-hidden min-h-screen">
        <I18nProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
