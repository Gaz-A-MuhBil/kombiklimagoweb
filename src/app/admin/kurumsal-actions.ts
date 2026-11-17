"use server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { bolumBul } from "@/lib/kurumsal-bolumler";
import { setKurumsal } from "@/lib/kurumsal";
import { saveImage } from "@/lib/uploads";

// GAZ-A Kurumsal sitesinin bir bölümünü kaydeder; site en geç 60 saniye içinde yeni içeriği gösterir
export async function kurumsalKaydet(anahtar: string, json: string): Promise<{ ok: true } | { hata: string }> {
  await requireAdmin();
  const bolum = bolumBul(anahtar);
  if (!bolum) return { hata: "Bilinmeyen bölüm." };
  if (json.length > 4_000_000) return { hata: "İçerik çok büyük." };
  let deger: unknown;
  try { deger = JSON.parse(json); } catch { return { hata: "İçerik okunamadı." }; }
  const beklenen = bolum.tur === "nesne" ? "object" : "array";
  if ((beklenen === "array") !== Array.isArray(deger) || deger === null || typeof deger !== "object") return { hata: "İçerik biçimi hatalı." };
  if (bolum.slugAlani && Array.isArray(deger)) {
    const ids = deger.map((x) => (x as Record<string, unknown>)[bolum.slugAlani!.alan]);
    if (ids.some((i) => typeof i !== "string" || !/^[a-z0-9-]+$/.test(i))) return { hata: "Sayfa adresleri yalnızca küçük harf, rakam ve tire içerebilir." };
    if (new Set(ids).size !== ids.length) return { hata: "İki kayıt aynı sayfa adresini kullanıyor." };
  }
  try {
    await setKurumsal(anahtar, deger);
  } catch (e) {
    return { hata: `Kaydedilemedi: ${(e as Error).message}` };
  }
  return { ok: true };
}

// Kurumsal site başka bir alan adında yayınlandığı için görsel tam adresle (bu sitenin adresi) saklanır
export async function kurumsalGorselYukle(f: FormData): Promise<{ url: string } | { hata: string }> {
  await requireAdmin();
  const file = f.get("dosya");
  if (!(file instanceof File) || !file.size) return { hata: "Dosya seçilmedi." };
  const r = await saveImage(file);
  if ("error" in r) return { hata: r.error };
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return { url: host ? `${proto}://${host}${r.url}` : r.url };
}
