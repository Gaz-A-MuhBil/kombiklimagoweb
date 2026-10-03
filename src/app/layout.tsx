import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BRAND, SITE } from "@/lib/seo";

// Manrope, sunucudan (Google'a bağlanmadan) yüklenir
const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "./fonts/manrope-0.ttf", weight: "400" },
    { path: "./fonts/manrope-1.ttf", weight: "500" },
    { path: "./fonts/manrope-2.ttf", weight: "600" },
    { path: "./fonts/manrope-3.ttf", weight: "700" },
    { path: "./fonts/manrope-4.ttf", weight: "800" },
  ],
});

const DESC = "Kombi Klima GO: İstanbul'da İGDAŞ yetkili bayi güvencesiyle kombi, klima, ısı pompası, radyatör ve şofbende uygun fiyat, faturalı ve garantili ürün, montaj, bakım ve servis.";

// Sitenin genel meta bilgileri. Sayfalar kendi başlık, açıklama ve asıl adreslerini (canonical) ekler;
// göreli adresler metadataBase ile tam adrese çevrilir.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Kombi Klima GO | Kombi, Klima ve Isı Pompası Çözümleri | İGDAŞ Yetkili Bayi",
  description: DESC,
  applicationName: BRAND,
  openGraph: { type: "website", locale: "tr_TR", siteName: BRAND, images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: BRAND }] },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
