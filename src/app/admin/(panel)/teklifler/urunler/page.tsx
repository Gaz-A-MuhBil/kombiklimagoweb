import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { Save, Search, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ensureTeklifTables } from "@/lib/teklif";
import { DOVIZLER } from "@/lib/teklif-tip";
import { urunGuncelle, urunSil } from "../../../teklif-actions";
import { ConfirmButton } from "../../_client";
import { Empty, Notice, PageHead, btnGhost, field, iconBtn } from "../../_ui";

export const dynamic = "force-dynamic";

const kucuk = "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

// Tekliflere girilmiş ürünler: teklif kaydedildikçe eklenir, burada düzeltilip silinebilir
export default async function UrunKutuphanesi({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string; err?: string }> }) {
  const sp = await searchParams;
  await ensureTeklifTables();
  const q = (sp.q ?? "").trim();
  const kelimeler = q.split(/\s+/).filter(Boolean).slice(0, 6);
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT * FROM teklif_urunler ${kelimeler.length ? `WHERE ${kelimeler.map(() => "CONCAT_WS(' ', tanim, marka) LIKE ?").join(" AND ")}` : ""} ORDER BY marka, tanim LIMIT 500`,
    kelimeler.map((k) => `%${k}%`));
  const [[say]] = await db().query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM teklif_urunler");

  return (
    <>
      <PageHead
        title="Teklif Ürün Kütüphanesi"
        sub="Tekliflere girdiğiniz her kalem burada saklanır; yeni teklifte tanım yazarken önerilir ve seçince marka, birim, fiyat ve döviz otomatik dolar. Fiyat, ürünün kullanıldığı son teklifteki fiyattır."
        back={{ href: "/admin/teklifler", label: "Teklifler" }}
      />
      <Notice saved={sp.saved} err={sp.err} text="Ürün güncellendi." />
      <form className="mb-5 flex gap-2">
        <label className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder={`${say?.n ?? 0} ürün içinde ara`} className={`${field} pl-10`} aria-label="Ürün ara" />
        </label>
        <button className={btnGhost}>Ara</button>
        {q && <Link href="/admin/teklifler/urunler" className={`${btnGhost} text-muted`}>Temizle</Link>}
      </form>
      {!rows.length ? (
        <Empty text={q ? "Aramanıza uyan ürün yok." : "Kütüphane boş. İlk teklifinizi kaydettiğinizde kalemler buraya eklenir."} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="bg-surface text-left text-xs font-bold uppercase tracking-wide text-muted">
              <tr><th className="px-3 py-2.5">Tanım</th><th className="px-3 py-2.5">Marka</th><th className="px-3 py-2.5">Birim</th><th className="px-3 py-2.5 text-right">Fiyat</th><th className="px-3 py-2.5">Döviz</th><th className="px-3 py-2.5 text-center">Kullanım</th><th className="px-3 py-2.5" /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const f = `u${r.id}`;
                return (
                  <tr key={r.id} className="align-middle">
                    <td className="px-3 py-2"><input form={f} name="tanim" defaultValue={r.tanim} className={kucuk} aria-label="Tanım" /></td>
                    <td className="w-40 px-3 py-2"><input form={f} name="marka" defaultValue={r.marka} className={kucuk} aria-label="Marka" /></td>
                    <td className="w-24 px-3 py-2"><input form={f} name="birim" defaultValue={r.birim} className={kucuk} aria-label="Birim" /></td>
                    <td className="w-32 px-3 py-2"><input form={f} name="fiyat" defaultValue={String(Number(r.fiyat)).replace(".", ",")} inputMode="decimal" className={`${kucuk} text-right tabular-nums`} aria-label="Fiyat" /></td>
                    <td className="w-24 px-3 py-2">
                      <select form={f} name="doviz" defaultValue={r.doviz} className={kucuk} aria-label="Döviz">{DOVIZLER.map((d) => <option key={d}>{d}</option>)}</select>
                    </td>
                    <td className="w-20 px-3 py-2 text-center tabular-nums text-muted">{r.kullanim}</td>
                    <td className="w-24 px-3 py-2">
                      <div className="flex justify-end">
                        <form id={f} action={urunGuncelle}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="q" value={q} />
                          <button className={iconBtn} title="Kaydet" aria-label="Kaydet"><Save size={16} /></button>
                        </form>
                        <form action={urunSil}><input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message="Ürün kütüphaneden silinecek (kayıtlı teklifler etkilenmez). Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Sil" aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
