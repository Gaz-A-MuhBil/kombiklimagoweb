import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { BookOpen, Copy, FileText, Pencil, Plus, Search, Settings, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ensureTeklifTables } from "@/lib/teklif";
import { DURUMLAR, MARKALAR, isDurum, isMarka, trTarih } from "@/lib/teklif-tip";
import { teklifKopyala, teklifSil } from "../../teklif-actions";
import { ConfirmButton } from "../_client";
import { Empty, Notice, PageHead, btnGhost, btnPrimary, field, iconBtn } from "../_ui";
import { DurumSec, ExcelIndir } from "./ListeIstemci";

export const dynamic = "force-dynamic";

const tarihSaat = (v: unknown) => new Date(v as string).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Teklifler({ searchParams }: { searchParams: Promise<{ q?: string; marka?: string; durum?: string; saved?: string }> }) {
  const sp = await searchParams;
  await ensureTeklifTables();
  const q = (sp.q ?? "").trim();
  const kosul: string[] = [];
  const deger: unknown[] = [];
  if (q) { kosul.push("(teklif_no LIKE ? OR firma LIKE ? OR proje LIKE ?)"); deger.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (isMarka(sp.marka)) { kosul.push("marka = ?"); deger.push(sp.marka); }
  if (isDurum(sp.durum)) { kosul.push("durum = ?"); deger.push(sp.durum); }
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT id, teklif_no, marka, durum, tarih, firma, proje, ozet, updated_at FROM teklifler ${kosul.length ? `WHERE ${kosul.join(" AND ")}` : ""} ORDER BY id DESC LIMIT 300`, deger);
  const [[sayac]] = await db().query<RowDataPacket[]>("SELECT COUNT(*) AS n, SUM(durum='onaylandi') AS onay, SUM(durum='gonderildi') AS bekleyen FROM teklifler");
  const filtreli = q || sp.marka || sp.durum;

  return (
    <>
      <PageHead
        title="Teklifler"
        sub="Müşterilerinize GAZ-A Mühendislik ya da Kombi Klima GO adına teklif hazırlayın; Excel (formüllü) ve yatay PDF olarak çıktısını alın. Girilen kalemler ürün kütüphanesine kaydedilir ve yeni tekliflerde tekrar kullanılır."
        newHref="/admin/teklifler/yeni"
        newLabel="Yeni Teklif"
      >
        <Link href="/admin/teklifler/urunler" className={btnGhost}><BookOpen size={16} />Ürün Kütüphanesi</Link>
        <Link href="/admin/teklifler/ayarlar" className={btnGhost}><Settings size={16} />Ayarlar</Link>
      </PageHead>
      <Notice saved={sp.saved} text={sp.saved === "silindi" ? "Teklif silindi." : "Değişiklikler kaydedildi."} />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          ["Toplam teklif", Number(sayac?.n ?? 0)],
          ["Yanıt bekleyen", Number(sayac?.bekleyen ?? 0)],
          ["Onaylanan", Number(sayac?.onay ?? 0)],
        ].map(([a, n]) => (
          <div key={a} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted">{a}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{n}</p>
          </div>
        ))}
      </div>

      <form className="mb-5 flex flex-wrap gap-2">
        <label className="relative min-w-0 flex-1 basis-64">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Teklif no, firma ya da proje ara" className={`${field} pl-10`} aria-label="Teklif ara" />
        </label>
        <select name="marka" defaultValue={sp.marka ?? ""} className={`${field} w-auto`} aria-label="Marka">
          <option value="">Tüm markalar</option>
          {Object.entries(MARKALAR).map(([k, v]) => <option key={k} value={k}>{v.ad}</option>)}
        </select>
        <select name="durum" defaultValue={sp.durum ?? ""} className={`${field} w-auto`} aria-label="Durum">
          <option value="">Tüm durumlar</option>
          {Object.entries(DURUMLAR).map(([k, v]) => <option key={k} value={k}>{v.ad}</option>)}
        </select>
        <button className={btnGhost}>Filtrele</button>
        {filtreli && <Link href="/admin/teklifler" className={`${btnGhost} text-muted`}>Temizle</Link>}
      </form>

      {!rows.length ? (
        <Empty
          text={filtreli ? "Aramanıza uyan teklif bulunamadı." : "Henüz teklif hazırlanmadı."}
          action={!filtreli && <Link href="/admin/teklifler/yeni" className={btnPrimary}><Plus size={16} />İlk teklifi hazırla</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const m = isMarka(r.marka) ? MARKALAR[r.marka] : MARKALAR.gazamuh;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="w-1.5 self-stretch rounded-full" style={{ background: m.renk }} aria-hidden />
                <div className="min-w-0 flex-1 basis-72">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/teklifler/${r.id}`} className="font-mono text-sm font-bold hover:text-primary">{r.teklif_no}</Link>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold" style={{ color: m.renk }}>{m.ad}</span>
                    <DurumSec id={r.id} durum={r.durum} />
                  </div>
                  <Link href={`/admin/teklifler/${r.id}`} className="mt-1 line-clamp-1 font-semibold hover:text-primary">{r.firma || "(müşteri yok)"}{r.proje && <span className="font-normal text-muted"> · {r.proje}</span>}</Link>
                  <p className="text-xs text-muted">{trTarih(new Date(r.tarih).toLocaleDateString("sv-SE"))} · son değişiklik {tarihSaat(r.updated_at)}</p>
                </div>
                <p className="text-right text-sm font-extrabold tabular-nums">{r.ozet}<span className="block text-[11px] font-semibold text-muted">KDV dahil</span></p>
                <div className="flex items-center">
                  <ExcelIndir id={r.id} />
                  <a href={`/admin/teklif-yazdir/${r.id}`} target="_blank" rel="noopener" className={iconBtn} title="PDF (yazdır)" aria-label="PDF"><FileText size={16} className="text-red-600" /></a>
                  <Link href={`/admin/teklifler/${r.id}`} className={iconBtn} title="Düzenle" aria-label="Düzenle"><Pencil size={16} /></Link>
                  <form action={teklifKopyala}><input type="hidden" name="id" value={r.id} />
                    <button className={iconBtn} title="Kopyala (yeni numarayla)" aria-label="Kopyala"><Copy size={16} /></button>
                  </form>
                  <form action={teklifSil}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message={`${r.teklif_no} numaralı teklif kalıcı olarak silinecek. Emin misiniz?`} className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Sil" aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
