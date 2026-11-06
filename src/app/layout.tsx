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
  metadataBase: new URL("https://espressonoble.uz"),
  title: "Espresso Noble & Roastery | Toshkentda Yangi Qahva & Tezkor Yetkazish",
  description:
    "Toshkentda 100% yangi qovurilgan Arabica qahvasi, nozik pishiriqlar va 30-40 daqiqada termo-sumkada issiq holda yetkazib berish xizmati.",
  keywords: [
    "kofe yetkazib berish",
    "kofe Toshkent",
    "qahva donalari",
    "specialty coffee Tashkent",
    "Espresso Noble",
    "kofe dostavka",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${playfair.variable} ${inter.variable} scroll-smooth dark`}>
      <body className="bg-[#090909] text-[#F5F2EB] font-sans antialiased selection:bg-[#D4AF37] selection:text-[#090909] overflow-x-hidden min-h-screen">
        <I18nProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
