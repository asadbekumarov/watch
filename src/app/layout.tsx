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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  // Demo site: Block all search engines from indexing
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  title: "SwissWatch Premium | Ko'rgazma Zali (Toshkent, Namangan)",
  description:
    "SwissWatch Premium — Toshkent va Namangan shaharlaridagi do'konlarda West End Watch hamda Jacques Philippe soatlari kolleksiyasi.",
  keywords: [
    "SwissWatch Premium",
    "SwissWatch_premium",
    "West End Watch",
    "Jacques Philippe",
    "soatlar Toshkent",
    "soatlar Namangan",
    "soat do'koni",
  ],
  openGraph: {
    title: "SwissWatch Premium — Ko'rgazma Zali (Toshkent, Namangan)",
    description:
      "West End Watch va Jacques Philippe soatlari kolleksiyasi. Toshkent va Namangandagi ko'rgazma zallari.",
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
