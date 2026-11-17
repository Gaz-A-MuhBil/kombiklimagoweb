"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ayarlarKaydetDb, ensureTeklifTables, teklifGetir, teklifKaydetDb, urunAraDb, type KutuphaneUrun } from "@/lib/teklif";
import { isDurum, temizle, type Ayarlar, type Teklif } from "@/lib/teklif-tip";

export async function teklifKaydet(json: string): Promise<{ ok: true; id: number; no: string } | { hata: string }> {
  await requireAdmin();
  if (json.length > 3_000_000) return { hata: "Teklif çok büyük (müşteri logosunu küçültün)." };
  let t;
  try { t = temizle(JSON.parse(json)); } catch { return { hata: "Teklif okunamadı." }; }
  // Boş satırlar (tanımı yazılmamış kalemler) kaydedilmez
  t.gruplar = t.gruplar.map((g) => ({ ...g, kalemler: g.kalemler.filter((k) => k.tanim.trim()) })).filter((g) => g.ad.trim() || g.kalemler.length);
  if (!t.gruplar.some((g) => g.kalemler.length)) return { hata: "En az bir kalem girin (ürün / hizmet tanımı)." };
  if (!t.musteri.firma.trim()) return { hata: "Müşteri firma adını girin." };
  try {
    const r = await teklifKaydetDb(t);
    revalidatePath("/admin/teklifler");
    return { ok: true, ...r };
  } catch (e) {
    return { hata: `Kaydedilemedi: ${(e as Error).message}` };
  }
}

export async function teklifSil(f: FormData) {
  await requireAdmin();
  await ensureTeklifTables();
  await db().query("DELETE FROM teklifler WHERE id = ?", [Number(f.get("id"))]);
  revalidatePath("/admin/teklifler");
  redirect("/admin/teklifler?saved=silindi");
}

// Var olan teklifi yeni numarayla kopyalar (aynı kalemlerle başka müşteriye/revizyona teklif)
export async function teklifKopyala(f: FormData) {
  await requireAdmin();
  const t = await teklifGetir(Number(f.get("id")));
  if (!t) redirect("/admin/teklifler");
  const d = new Date();
  const tarih = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const r = await teklifKaydetDb({ ...t, id: undefined, no: undefined, durum: "taslak", tarih });
  revalidatePath("/admin/teklifler");
  redirect(`/admin/teklifler/${r.id}?kopya=${encodeURIComponent(t.no ?? "")}`);
}

export async function teklifDurumAyarla(id: number, durum: string) {
  await requireAdmin();
  if (!isDurum(durum)) return;
  await ensureTeklifTables();
  const t = await teklifGetir(Number(id));
  if (!t) return;
  // yalnızca durum değişir; ürün kütüphanesi yeniden işlenmez
  await db().query("UPDATE teklifler SET durum = ?, veri = ? WHERE id = ?", [durum, JSON.stringify({ ...t, id: undefined, durum }), t.id]);
  revalidatePath("/admin/teklifler");
}

export async function teklifVeri(id: number): Promise<Teklif | null> {
  await requireAdmin();
  return teklifGetir(Number(id));
}

export async function urunAra(q: string): Promise<KutuphaneUrun[]> {
  await requireAdmin();
  try { return await urunAraDb(String(q).slice(0, 100)); } catch { return []; }
}

export async function urunSil(f: FormData) {
  await requireAdmin();
  await ensureTeklifTables();
  await db().query("DELETE FROM teklif_urunler WHERE id = ?", [Number(f.get("id"))]);
  revalidatePath("/admin/teklifler/urunler");
}

export async function urunGuncelle(f: FormData) {
  await requireAdmin();
  await ensureTeklifTables();
  const doviz = ["TL", "EUR", "USD"].includes(String(f.get("doviz"))) ? String(f.get("doviz")) : "TL";
  const fiyat = Number(String(f.get("fiyat") ?? "").replace(",", "."));
  try {
    await db().query("UPDATE teklif_urunler SET tanim=?, marka=?, birim=?, fiyat=?, doviz=? WHERE id=?", [
      String(f.get("tanim") ?? "").trim().slice(0, 300), String(f.get("marka") ?? "").trim().slice(0, 100),
      String(f.get("birim") ?? "Adet").slice(0, 20), Number.isFinite(fiyat) ? fiyat : 0, doviz, Number(f.get("id")),
    ]);
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_ENTRY") redirect("/admin/teklifler/urunler?err=" + encodeURIComponent("Aynı tanım ve markayla başka bir ürün var."));
    throw e;
  }
  revalidatePath("/admin/teklifler/urunler");
  redirect(`/admin/teklifler/urunler?saved=1&q=${encodeURIComponent(String(f.get("q") ?? ""))}`);
}

export async function ayarlarKaydet(f: FormData) {
  await requireAdmin();
  const a: Ayarlar = {
    konu: String(f.get("konu") ?? "").trim().slice(0, 200),
    giris: String(f.get("giris") ?? "").trim().slice(0, 3000),
    notlar: String(f.get("notlar") ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 40),
  };
  await ayarlarKaydetDb(a);
  redirect("/admin/teklifler/ayarlar?saved=1");
}
