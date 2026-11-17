"use client";
import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

// Baskı sayfasının üst çubuğu (çıktıda görünmez). Sayfa açılınca yazdırma penceresi bir kez kendiliğinden açılır.
export function YazdirCubugu({ duzenle, otomatik = true }: { duzenle: string; otomatik?: boolean }) {
  useEffect(() => {
    if (!otomatik) return;
    const ac = () => setTimeout(() => window.print(), 350);
    // görseller (logolar) yüklendikten sonra
    if (document.readyState === "complete") ac();
    else window.addEventListener("load", ac, { once: true });
    return () => window.removeEventListener("load", ac);
  }, [otomatik]);
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 text-sm backdrop-blur print:hidden">
      <a href={duzenle} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"><ArrowLeft size={16} />Teklife dön</a>
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800"><Printer size={16} />PDF olarak kaydet / Yazdır</button>
      <span className="text-slate-500">Yazdırma penceresinde hedef olarak <b>“PDF olarak kaydet”</b> seçin. Sayfa yönü yatay ayarlıdır.</span>
    </div>
  );
}
