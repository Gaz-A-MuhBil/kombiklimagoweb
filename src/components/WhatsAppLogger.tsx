"use client";
import { useEffect } from "react";
import { logWhatsApp } from "@/lib/wa-log-client";

// Sitedeki tüm wa.me bağlantılarını tek yerden yakalar (fiyat sorma, sağ alttaki buton, iletişim…); tıklamayı engellemez.
// Sepetteki sipariş butonu bağlantı değil window.open kullandığı için CartView kendisi kaydeder.
export function WhatsAppLogger() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="wa.me/"]');
      if (!a) return;
      try {
        logWhatsApp(new URL(a.getAttribute("href") ?? "").searchParams.get("text") ?? "");
      } catch {
        // bozuk bağlantı: kayıt atlanır
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
