import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"),
  title: "SwissWatch Premium | Admin Panel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased bg-[#0d0f12] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

