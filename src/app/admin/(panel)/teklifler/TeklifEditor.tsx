"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, BookOpen, Check, CircleAlert, CircleCheck, Copy, FileSpreadsheet, FileText, ImagePlus, Loader2, Plus, Save, Search, Store, Trash2, UserRound, X,
} from "lucide-react";
import { teklifKaydet, urunAra } from "../../teklif-actions";
import type { KutuphaneUrun } from "@/lib/teklif";
import {
  BIRIMLER, DOVIZLER, DURUMLAR, HAZIRLAYAN, MARKALAR, bosKalem, gecerlilikTarihi, grupKodu, hesapla, para, satirToplam, yeniId,
  type Doviz, type Durum, type Grup, type Kalem, type MarkaKey, type Musteri, type Teklif,
} from "@/lib/teklif-tip";
import { btnGhost, btnPrimary, card, field, iconBtn } from "../_ui";

const kucukAlan = "w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15";
const etiket = "mb-1.5 block text-sm font-semibold";

// Ondalık sayı girişi: virgül ya da nokta kabul eder (1.250,50 / 1250.5)
function sayiOku(s: string): number | null {
  const t = s.trim().replace(/\s/g, "");
  if (!t) return 0;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? n : null;
}
const sayiYaz = (n: number) => (n ? String(n).replace(".", ",") : "");

function Sayi({ deger, degis, className, placeholder, ...rest }: { deger: number | null; degis: (n: number) => void; className?: string; placeholder?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [ham, setHam] = useState(sayiYaz(deger ?? 0));
  const odak = useRef(false);
  useEffect(() => { if (!odak.current) setHam(sayiYaz(deger ?? 0)); }, [deger]);
  const n = sayiOku(ham);
  return (
    <input
      {...rest}
      inputMode="decimal"
      value={ham}
      placeholder={placeholder ?? "0"}
      onFocus={() => (odak.current = true)}
      onBlur={() => { odak.current = false; setHam(sayiYaz(deger ?? 0)); }}
      onChange={(e) => { setHam(e.target.value); const v = sayiOku(e.target.value); if (v !== null) degis(v); }}
      className={`${className ?? kucukAlan} text-right tabular-nums ${n === null ? "border-red-400 ring-2 ring-red-100" : ""}`}
    />
  );
}

// Ürün tanımı: yazdıkça ürün kütüphanesinde ve mağaza ürünlerinde arar; seçilen ürün satırı doldurur
function TanimGir({ kalem, degis, sec }: { kalem: Kalem; degis: (s: string) => void; sec: (u: KutuphaneUrun) => void }) {
  const [acik, setAcik] = useState(false);
  const [sonuc, setSonuc] = useState<KutuphaneUrun[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const zaman = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sira = useRef(0);

  const ara = (q: string) => {
    if (zaman.current) clearTimeout(zaman.current);
    zaman.current = setTimeout(async () => {
      const no = ++sira.current;
      setYukleniyor(true);
      const r = await urunAra(q);
      if (no === sira.current) { setSonuc(r); setYukleniyor(false); }
    }, 220);
  };

  return (
    <div className="relative">
      <textarea
        rows={1}
        value={kalem.tanim}
        onChange={(e) => { degis(e.target.value.replace(/\n/g, " ")); setAcik(true); ara(e.target.value); }}
        onFocus={() => { setAcik(true); ara(kalem.tanim); }}
        onBlur={() => setTimeout(() => setAcik(false), 180)}
        onKeyDown={(e) => e.key === "Escape" && setAcik(false)}
        placeholder="Ürün / hizmet yazın ya da kütüphaneden seçin"
        className={`${kucukAlan} block resize-none font-medium leading-snug [field-sizing:content]`}
        autoComplete="off"
      />
      {acik && (sonuc.length > 0 || yukleniyor) && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 min-w-[22rem] overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-xl">
          {yukleniyor && !sonuc.length && <p className="flex items-center gap-2 px-3 py-2 text-xs text-muted"><Loader2 size={14} className="animate-spin" />Aranıyor…</p>}
          {!kalem.tanim.trim() && sonuc.length > 0 && <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted">Son kullanılan ürünler</p>}
          {sonuc.map((u) => (
            <button
              key={`${u.kaynak}-${u.id}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { sec(u); setAcik(false); }}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface"
            >
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${u.kaynak === "magaza" ? "bg-orange-50 text-orange-600" : "bg-primary/10 text-primary"}`}>
                {u.kaynak === "magaza" ? <Store size={13} /> : <BookOpen size={13} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug">{u.tanim}</span>
                <span className="block text-xs text-muted">
                  {[u.marka, u.kaynak === "magaza" ? "Mağaza ürünü" : `Teklif kütüphanesi${u.kullanim ? ` · ${u.kullanim} kez kullanıldı` : ""}`].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums">{u.fiyat ? para(u.fiyat, u.doviz) : "—"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Müşteri logosu: tarayıcıda küçültülüp PNG olarak teklifle birlikte saklanır
async function logoHazirla(f: File): Promise<string> {
  const bmp = await createImageBitmap(f);
  const k = Math.min(1, 600 / bmp.width, 240 / bmp.height);
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
}

export function TeklifEditor({ ilk, musteriler, kopya }: { ilk: Teklif; musteriler: Musteri[]; kopya?: string }) {
  const router = useRouter();
  const [t, setT] = useState<Teklif>(ilk);
  const [kirli, setKirli] = useState(false);
  const [mesaj, setMesaj] = useState<{ ok: boolean; text: string } | null>(kopya ? { ok: true, text: `${kopya} numaralı tekliften kopyalandı. Yeni numara: ${ilk.no}` } : null);
  const [bekliyor, basla] = useTransition();
  const [excelHazirlaniyor, setExcelHazirlaniyor] = useState(false);
  const [logoHata, setLogoHata] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const h = useMemo(() => hesapla(t), [t]);
  const m = MARKALAR[t.marka];

  useEffect(() => {
    if (!kirli) return;
    const uyar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", uyar);
    return () => window.removeEventListener("beforeunload", uyar);
  }, [kirli]);

  const guncelle = (f: (x: Teklif) => Teklif) => { setT((x) => f(x)); setKirli(true); };
  const alan = <K extends keyof Teklif>(k: K, v: Teklif[K]) => guncelle((x) => ({ ...x, [k]: v }));
  const musteri = (k: keyof Musteri, v: string) => guncelle((x) => ({ ...x, musteri: { ...x.musteri, [k]: v } }));
  const grup = (gi: number, f: (g: Grup) => Grup) => guncelle((x) => ({ ...x, gruplar: x.gruplar.map((g, i) => (i === gi ? f(g) : g)) }));
  const kalem = (gi: number, ki: number, f: (k: Kalem) => Kalem) => grup(gi, (g) => ({ ...g, kalemler: g.kalemler.map((k, i) => (i === ki ? f(k) : k)) }));
  const tasi = <T,>(dizi: T[], i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= dizi.length) return dizi;
    const d = [...dizi];
    [d[i], d[j]] = [d[j], d[i]];
    return d;
  };
  const sonDoviz = (g: Grup) => g.kalemler.at(-1)?.doviz ?? "TL";

  // Firma adı daha önceki bir teklifteki müşteriyle eşleşirse bilgileri doldurulabilir
  const kayitliMusteri = musteriler.find((x) => x.firma.trim().toLocaleLowerCase("tr") === t.musteri.firma.trim().toLocaleLowerCase("tr"));
  const musteriFarkli = kayitliMusteri && (["ilgili", "telefon", "eposta", "adres", "vergi", "logo"] as const).some((k) => kayitliMusteri[k] && kayitliMusteri[k] !== t.musteri[k]);

  async function kaydet(): Promise<Teklif | null> {
    setMesaj(null);
    const r = await teklifKaydet(JSON.stringify(t));
    if ("hata" in r) { setMesaj({ ok: false, text: r.hata }); return null; }
    const yeni = { ...t, id: r.id, no: r.no };
    // boş satırlar sunucuda atılır; formda da temizlenir
    yeni.gruplar = yeni.gruplar.map((g) => ({ ...g, kalemler: g.kalemler.filter((k) => k.tanim.trim()) })).filter((g) => g.ad.trim() || g.kalemler.length);
    setT(yeni);
    setKirli(false);
    setMesaj({ ok: true, text: `Teklif kaydedildi (${r.no}). Kalemler ürün kütüphanesine eklendi.` });
    if (!t.id) router.replace(`/admin/teklifler/${r.id}`, { scroll: false });
    else router.refresh();
    return yeni;
  }

  const kaydetTikla = () => basla(async () => { await kaydet(); });

  const excel = () => basla(async () => {
    const k = kirli || !t.id ? await kaydet() : t;
    if (!k) return;
    setExcelHazirlaniyor(true);
    try {
      const { teklifExcel } = await import("@/lib/teklif-excel");
      await teklifExcel(k);
    } catch (e) {
      setMesaj({ ok: false, text: `Excel oluşturulamadı: ${(e as Error).message}` });
    } finally {
      setExcelHazirlaniyor(false);
    }
  });

  const pdf = () => {
    // Açılır pencere engellenmesin diye pencere hemen açılır, adresi kayıttan sonra verilir
    const w = window.open("about:blank", "_blank");
    basla(async () => {
      const k = kirli || !t.id ? await kaydet() : t;
      if (!k?.id) { w?.close(); return; }
      if (w) w.location.href = `/admin/teklif-yazdir/${k.id}`;
      else router.push(`/admin/teklif-yazdir/${k.id}`);
    });
  };

  const logoSec = async (f: File | undefined) => {
    setLogoHata("");
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { setLogoHata("PNG, JPG ya da WebP seçin."); return; }
    try {
      const url = await logoHazirla(f);
      if (url.length > 1_400_000) { setLogoHata("Logo çok büyük; daha küçük bir dosya seçin."); return; }
      musteri("logo", url);
    } catch {
      setLogoHata("Görsel okunamadı.");
    }
  };

  const kalemSayisi = t.gruplar.reduce((s, g) => s + g.kalemler.filter((k) => k.tanim.trim()).length, 0);
  const yabanci = h.dovizler.filter((d) => d !== "TL") as ("EUR" | "USD")[];

  return (
    <div className="pb-28">
      {mesaj && (
        <p role={mesaj.ok ? "status" : "alert"} className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${mesaj.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {mesaj.ok ? <CircleCheck size={18} /> : <CircleAlert size={18} />}{mesaj.text}
        </p>
      )}

      {/* 1. Marka */}
      <section className={`${card} mb-5`}>
        <h2 className="mb-1 text-base font-extrabold">Teklifi hangi marka adına hazırlıyorsunuz?</h2>
        <p className="mb-4 text-sm text-muted">Seçilen markanın logosu, renkleri ve iletişim bilgileri Excel ve PDF çıktısında kullanılır.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(MARKALAR) as MarkaKey[]).map((k) => {
            const secili = t.marka === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => alan("marka", k)}
                aria-pressed={secili}
                className={`relative flex h-24 items-center justify-center rounded-2xl border-2 bg-white px-6 transition ${secili ? "shadow-md" : "border-border opacity-60 hover:opacity-100"}`}
                style={secili ? { borderColor: MARKALAR[k].renk } : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MARKALAR[k].logo} alt={MARKALAR[k].ad} className="max-h-14 w-auto max-w-[80%] object-contain" />
                {secili && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: MARKALAR[k].renk }}><Check size={14} /></span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        {/* 2. Müşteri */}
        <section className={card}>
          <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold"><UserRound size={18} />Müşteri Bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={etiket}>Firma / Müşteri adı <span className="text-red-600">*</span></span>
              <input list="teklif-musteriler" value={t.musteri.firma} onChange={(e) => musteri("firma", e.target.value)} className={field} placeholder="Örn. Acarkent İsotlar Villa" />
              <datalist id="teklif-musteriler">{musteriler.map((x) => <option key={x.firma} value={x.firma} />)}</datalist>
              {musteriFarkli && (
                <button
                  type="button"
                  onClick={() => guncelle((x) => ({ ...x, musteri: { ...kayitliMusteri!, firma: x.musteri.firma } }))}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/15"
                >
                  <Copy size={13} />Önceki teklifteki bilgilerini doldur
                </button>
              )}
            </label>
            <label><span className={etiket}>İlgili kişi</span><input value={t.musteri.ilgili} onChange={(e) => musteri("ilgili", e.target.value)} className={field} placeholder="Örn. Ahmet Bey" /></label>
            <label><span className={etiket}>Telefon</span><input value={t.musteri.telefon} onChange={(e) => musteri("telefon", e.target.value)} className={field} inputMode="tel" /></label>
            <label><span className={etiket}>E-posta</span><input value={t.musteri.eposta} onChange={(e) => musteri("eposta", e.target.value)} className={field} inputMode="email" /></label>
            <label><span className={etiket}>Vergi dairesi / no</span><input value={t.musteri.vergi} onChange={(e) => musteri("vergi", e.target.value)} className={field} /></label>
            <label className="sm:col-span-2"><span className={etiket}>Adres</span><textarea rows={2} value={t.musteri.adres} onChange={(e) => musteri("adres", e.target.value)} className={field} /></label>
            <div className="sm:col-span-2">
              <span className={etiket}>Müşteri logosu</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-20 w-44 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {t.musteri.logo ? <img src={t.musteri.logo} alt="Müşteri logosu" className="max-h-16 max-w-40 object-contain" /> : <span className="text-xs text-muted">Logo yok</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => logoInput.current?.click()} className={btnGhost}><ImagePlus size={16} />{t.musteri.logo ? "Değiştir" : "Logo yükle"}</button>
                  {t.musteri.logo && <button type="button" onClick={() => musteri("logo", "")} className={`${btnGhost} text-red-600`}><Trash2 size={16} />Kaldır</button>}
                </div>
                <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { logoSec(e.target.files?.[0]); e.target.value = ""; }} />
              </div>
              <p className={`mt-1.5 text-xs ${logoHata ? "font-semibold text-red-600" : "text-muted"}`}>{logoHata || "Şeffaf arka planlı PNG en iyi sonucu verir. Excel ve PDF'te sağ üstte görünür."}</p>
            </div>
          </div>
        </section>

        {/* 3. Teklif bilgileri */}
        <section className={card}>
          <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold"><FileText size={18} />Teklif Bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={etiket}>Teklif no</span>
              <p className="rounded-xl bg-surface px-4 py-2.5 font-mono text-sm font-bold">{t.no ?? <span className="font-sans font-normal text-muted">Kaydedince verilir</span>}</p>
            </div>
            <label>
              <span className={etiket}>Durum</span>
              <select value={t.durum} onChange={(e) => alan("durum", e.target.value as Durum)} className={field}>
                {(Object.keys(DURUMLAR) as Durum[]).map((d) => <option key={d} value={d}>{DURUMLAR[d].ad}</option>)}
              </select>
            </label>
            <label><span className={etiket}>Teklif tarihi</span><input type="date" value={t.tarih} onChange={(e) => alan("tarih", e.target.value)} className={field} /></label>
            <label>
              <span className={etiket}>Geçerlilik (gün)</span>
              <Sayi deger={t.gecerlilik} degis={(n) => alan("gecerlilik", Math.max(0, Math.round(n)))} className={field} />
              {t.gecerlilik > 0 && <span className="mt-1 block text-xs text-muted">{gecerlilikTarihi(t.tarih, t.gecerlilik)} tarihine kadar</span>}
            </label>
            <label className="sm:col-span-2"><span className={etiket}>Proje adı</span><input value={t.proje} onChange={(e) => alan("proje", e.target.value)} className={field} placeholder="Örn. Acarkent İsotlar Villa Isıtma Projesi" /></label>
            <label className="sm:col-span-2"><span className={etiket}>Teklif başlığı (konu)</span><input value={t.konu} onChange={(e) => alan("konu", e.target.value)} className={field} /></label>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: m.renk }}>EK</span>
            <div className="min-w-0 text-sm">
              <p className="font-bold">Hazırlayan: {HAZIRLAYAN.ad}</p>
              <p className="truncate text-xs text-muted">{m.ad} · {HAZIRLAYAN.telefon} · {m.eposta}</p>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Kalemler */}
      <section className="mb-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">Teklif Kalemleri</h2>
            <p className="text-sm text-muted">Kalemleri bölümlere ayırabilirsiniz (ör. Kazan Sistemi, Radyatörler, İşçilik). Tanım yazarken daha önce girilen ürünler ve mağaza ürünleri önerilir.</p>
          </div>
          <button type="button" onClick={() => guncelle((x) => ({ ...x, gruplar: [...x.gruplar, { id: yeniId(), ad: "", kalemler: [bosKalem(sonDoviz(x.gruplar.at(-1) ?? { id: "", ad: "", kalemler: [] }))] }] }))} className={btnGhost}>
            <Plus size={16} />Bölüm ekle
          </button>
        </div>

        <div className="space-y-4">
          {t.gruplar.map((g, gi) => (
            <div key={g.id} className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3" style={{ background: `${m.renk}0d` }}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold text-white" style={{ background: m.renk }}>{grupKodu(gi)}</span>
                <input value={g.ad} onChange={(e) => grup(gi, (x) => ({ ...x, ad: e.target.value }))} placeholder="Bölüm adı (ör. KAZAN SİSTEMİ)" className={`${kucukAlan} min-w-0 flex-1 font-bold uppercase`} />
                <span className="ml-auto text-sm font-bold tabular-nums text-muted">
                  {h.dovizler.filter((d) => h.gruplar[gi][d]).map((d) => para(h.gruplar[gi][d], d)).join(" + ") || "—"}
                </span>
                <div className="flex">
                  <button type="button" className={`${iconBtn} disabled:opacity-30`} disabled={gi === 0} onClick={() => guncelle((x) => ({ ...x, gruplar: tasi(x.gruplar, gi, -1) }))} aria-label="Bölümü yukarı taşı"><ArrowUp size={16} /></button>
                  <button type="button" className={`${iconBtn} disabled:opacity-30`} disabled={gi === t.gruplar.length - 1} onClick={() => guncelle((x) => ({ ...x, gruplar: tasi(x.gruplar, gi, 1) }))} aria-label="Bölümü aşağı taşı"><ArrowDown size={16} /></button>
                  <button
                    type="button"
                    className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
                    onClick={() => { if (!g.kalemler.some((k) => k.tanim.trim()) || confirm(`"${g.ad || grupKodu(gi)}" bölümü ve içindeki kalemler silinecek. Emin misiniz?`)) guncelle((x) => ({ ...x, gruplar: x.gruplar.filter((_, i) => i !== gi) })); }}
                    aria-label="Bölümü sil"
                  ><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="hidden grid-cols-[1.5rem_minmax(0,1fr)_7rem_4.5rem_5rem_7rem_4.75rem_7.5rem_5.25rem] gap-2 px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-muted xl:grid">
                <span>#</span><span>Ürün / hizmet tanımı</span><span>Marka</span><span className="text-right">Miktar</span><span>Birim</span><span className="text-right">Birim fiyat</span><span>Döviz</span><span className="text-right">Toplam</span><span />
              </div>
              <ul className="divide-y divide-border/70">
                {g.kalemler.map((k, ki) => (
                  <li key={k.id} className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4 xl:grid-cols-[1.5rem_minmax(0,1fr)_7rem_4.5rem_5rem_7rem_4.75rem_7.5rem_5.25rem] xl:items-start">
                    <span className="col-span-2 pt-2 text-sm font-bold text-muted sm:col-span-4 xl:col-span-1">{ki + 1}</span>
                    <div className="col-span-2 sm:col-span-4 xl:col-span-1">
                      <TanimGir
                        kalem={k}
                        degis={(s) => kalem(gi, ki, (x) => ({ ...x, tanim: s }))}
                        sec={(u) => kalem(gi, ki, (x) => ({ ...x, tanim: u.tanim, marka: u.marka || x.marka, birim: u.birim || x.birim, fiyat: u.fiyat, doviz: u.doviz }))}
                      />
                      <input value={k.aciklama} onChange={(e) => kalem(gi, ki, (x) => ({ ...x, aciklama: e.target.value }))} placeholder="Açıklama / not (isteğe bağlı: ölçü, renk, konum…)" className="mt-1.5 w-full rounded-lg border border-transparent bg-transparent px-2.5 py-1 text-xs text-muted outline-none hover:border-border focus:border-accent focus:bg-white" />
                    </div>
                    <label className="col-span-2 sm:col-span-2 xl:col-span-1"><span className="mb-1 block text-xs font-semibold text-muted xl:hidden">Marka</span><input value={k.marka} onChange={(e) => kalem(gi, ki, (x) => ({ ...x, marka: e.target.value }))} className={kucukAlan} /></label>
                    <label><span className="mb-1 block text-xs font-semibold text-muted xl:hidden">Miktar</span><Sayi deger={k.miktar} degis={(n) => kalem(gi, ki, (x) => ({ ...x, miktar: n }))} /></label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-muted xl:hidden">Birim</span>
                      <input list="teklif-birimler" value={k.birim} onChange={(e) => kalem(gi, ki, (x) => ({ ...x, birim: e.target.value }))} className={kucukAlan} />
                    </label>
                    <label><span className="mb-1 block text-xs font-semibold text-muted xl:hidden">Birim fiyat</span><Sayi deger={k.fiyat} degis={(n) => kalem(gi, ki, (x) => ({ ...x, fiyat: n }))} /></label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-muted xl:hidden">Döviz</span>
                      <select value={k.doviz} onChange={(e) => kalem(gi, ki, (x) => ({ ...x, doviz: e.target.value as Doviz }))} className={kucukAlan}>
                        {DOVIZLER.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </label>
                    <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-4 xl:col-span-1 xl:block xl:pt-2 xl:text-right">
                      <span className="text-xs font-semibold text-muted xl:hidden">Toplam</span>
                      <span className="text-sm font-extrabold tabular-nums">{para(satirToplam(k), k.doviz)}</span>
                    </div>
                    <div className="col-span-2 flex justify-end sm:col-span-4 xl:col-span-1">
                      <button type="button" className={`${iconBtn} h-8 w-8 disabled:opacity-30`} disabled={ki === 0} onClick={() => grup(gi, (x) => ({ ...x, kalemler: tasi(x.kalemler, ki, -1) }))} aria-label="Yukarı taşı"><ArrowUp size={15} /></button>
                      <button type="button" className={`${iconBtn} h-8 w-8 disabled:opacity-30`} disabled={ki === g.kalemler.length - 1} onClick={() => grup(gi, (x) => ({ ...x, kalemler: tasi(x.kalemler, ki, 1) }))} aria-label="Aşağı taşı"><ArrowDown size={15} /></button>
                      <button type="button" className={`${iconBtn} h-8 w-8 hover:bg-red-50 hover:text-red-600`} onClick={() => grup(gi, (x) => ({ ...x, kalemler: x.kalemler.filter((_, i) => i !== ki) }))} aria-label="Satırı sil"><X size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                <button type="button" onClick={() => grup(gi, (x) => ({ ...x, kalemler: [...x.kalemler, bosKalem(sonDoviz(x))] }))} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/10">
                  <Plus size={15} />Satır ekle
                </button>
                <span className="inline-flex items-center gap-1.5 px-1 text-xs text-muted"><Search size={13} />Ürün aramak için tanım alanına yazmaya başlayın</span>
              </div>
            </div>
          ))}
          {!t.gruplar.length && (
            <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">Henüz bölüm yok. “Bölüm ekle” ile başlayın.</p>
          )}
        </div>
        <datalist id="teklif-birimler">{BIRIMLER.map((b) => <option key={b} value={b} />)}</datalist>
      </section>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_24rem]">
        {/* 5. Metinler */}
        <section className={card}>
          <h2 className="mb-4 text-base font-extrabold">Giriş Metni ve Notlar</h2>
          <label className="mb-4 block">
            <span className={etiket}>Giriş metni</span>
            <textarea rows={3} value={t.giris} onChange={(e) => alan("giris", e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className={etiket}>Notlar (her satır bir madde)</span>
            <textarea
              rows={Math.min(14, Math.max(6, t.notlar.length + 2))}
              defaultValue={t.notlar.join("\n")}
              onChange={(e) => alan("notlar", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              className={`${field} leading-relaxed`}
            />
            <span className="mt-1.5 block text-xs text-muted">Yeni tekliflerde gelen sabit notları <Link href="/admin/teklifler/ayarlar" target="_blank" className="font-semibold text-primary hover:underline">Teklif Ayarları</Link> sayfasından değiştirebilirsiniz.</span>
          </label>
        </section>

        {/* 6. Hesap */}
        <section className={`${card} lg:sticky lg:top-6 lg:self-start`}>
          <h2 className="mb-4 text-base font-extrabold">Toplamlar</h2>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <label><span className="mb-1 block text-xs font-semibold text-muted">İskonto (%)</span><Sayi deger={t.iskonto} degis={(n) => alan("iskonto", Math.min(100, Math.max(0, n)))} /></label>
            <label><span className="mb-1 block text-xs font-semibold text-muted">KDV (%)</span><Sayi deger={t.kdv} degis={(n) => alan("kdv", Math.min(100, Math.max(0, n)))} /></label>
            {yabanci.map((d) => (
              <label key={d}>
                <span className="mb-1 block text-xs font-semibold text-muted">{d} kuru (TL)</span>
                <Sayi deger={t.kurlar[d]} placeholder="Boş" degis={(n) => alan("kurlar", { ...t.kurlar, [d]: n || null })} />
              </label>
            ))}
          </div>
          <dl className="space-y-1.5 text-sm">
            {h.dovizler.map((d) => (
              <div key={d} className="rounded-xl bg-surface/70 p-3">
                <div className="flex justify-between"><dt className="text-muted">Ara toplam</dt><dd className="font-semibold tabular-nums">{para(h.ara[d], d)}</dd></div>
                {t.iskonto > 0 && <div className="flex justify-between"><dt className="text-muted">İskonto (%{t.iskonto})</dt><dd className="font-semibold tabular-nums text-red-600">−{para(h.iskonto[d], d)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted">KDV (%{t.kdv})</dt><dd className="font-semibold tabular-nums">{para(h.kdv[d], d)}</dd></div>
                <div className="mt-1 flex justify-between border-t border-border pt-1.5"><dt className="font-bold">Genel toplam</dt><dd className="font-extrabold tabular-nums" style={{ color: m.renk }}>{para(h.genel[d], d)}</dd></div>
              </div>
            ))}
            {yabanci.length > 0 && (
              <div className="flex justify-between rounded-xl border border-dashed border-border p-3">
                <dt className="font-bold">TL karşılığı (KDV dahil)</dt>
                <dd className="font-extrabold tabular-nums">{h.tlKarsilik != null ? para(h.tlKarsilik, "TL") : <span className="text-xs font-normal text-muted">Kur girilince hesaplanır</span>}</dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-xs text-muted">{kalemSayisi} kalem · Fiyatlar KDV hariç girilir.</p>
        </section>
      </div>

      {/* Kaydet çubuğu */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur lg:left-64">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-sm text-muted">
            {kirli ? <span className="font-semibold text-amber-700">Kaydedilmemiş değişiklikler var</span> : t.no ? <>Kayıtlı · <span className="font-mono font-bold text-foreground">{t.no}</span></> : "Yeni teklif"}
          </p>
          <button type="button" onClick={excel} disabled={bekliyor} className={`${btnGhost} disabled:opacity-60`}>
            {excelHazirlaniyor ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-green-700" />}Excel indir
          </button>
          <button type="button" onClick={pdf} disabled={bekliyor} className={`${btnGhost} disabled:opacity-60`}>
            <FileText size={16} className="text-red-600" />PDF
          </button>
          <button type="button" onClick={kaydetTikla} disabled={bekliyor} className={`${btnPrimary} disabled:opacity-60`}>
            {bekliyor && !excelHazirlaniyor ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
