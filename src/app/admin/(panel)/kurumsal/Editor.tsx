"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, CircleAlert, CircleCheck, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import type { Alan, Bolum } from "@/lib/kurumsal-bolumler";
import { kurumsalGorselYukle, kurumsalKaydet } from "../../kurumsal-actions";
import { btnGhost, btnPrimary, card, field, iconBtn } from "../_ui";

type Kayit = Record<string, unknown>;

const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };
const slugla = (s: string) =>
  s.replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR[c]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Alanın boş değeri (yeni kayıtta)
function bos(a: Alan): unknown {
  if (a.tip === "lines" || a.tip === "paras") return [];
  if (a.tip === "number") return 0;
  if (a.tip === "check") return false;
  if (a.tip === "select") return a.secenekler?.[0] ?? "";
  if (a.tip === "date") return new Date().toISOString().slice(0, 10);
  return "";
}

// Dizi alanlar metin kutusunda düzenlenir: satırlar ya da boş satırla ayrılmış paragraflar
const diziMetin = (v: unknown, tip: "lines" | "paras") => (Array.isArray(v) ? v.join(tip === "lines" ? "\n" : "\n\n") : "");
const metinDizi = (s: string, tip: "lines" | "paras") =>
  (tip === "lines" ? s.split("\n") : s.split(/\n\s*\n/)).map((x) => x.trim()).filter(Boolean);

function AlanGir({ a, deger, degis }: { a: Alan; deger: unknown; degis: (v: unknown) => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const dosya = useRef<HTMLInputElement>(null);
  // Dizi alanlarda yazarken boş satırlar silinmesin diye ham metin ayrıca tutulur
  const [ham, setHam] = useState(() => (a.tip === "lines" || a.tip === "paras" ? diziMetin(deger, a.tip) : ""));

  const etiket = (
    <span className="mb-1.5 block text-sm font-semibold">
      {a.ad}{a.zorunlu && <span className="text-red-600"> *</span>}
    </span>
  );
  const ipucu = (a.ipucu || hata) && <span className={`mt-1.5 block text-xs ${hata ? "font-semibold text-red-600" : "text-muted"}`}>{hata || a.ipucu}</span>;
  const s = typeof deger === "string" ? deger : deger == null ? "" : String(deger);

  if (a.tip === "check") {
    return (
      <label className="flex items-center gap-3 self-end py-2 text-sm font-semibold">
        <input type="checkbox" checked={!!deger} onChange={(e) => degis(e.target.checked)} className="h-4 w-4 accent-primary" />
        {a.ad}
      </label>
    );
  }

  if (a.tip === "image") {
    const yukle = async (f: File) => {
      setHata(""); setYukleniyor(true);
      const fd = new FormData(); fd.set("dosya", f);
      const r = await kurumsalGorselYukle(fd);
      setYukleniyor(false);
      if ("hata" in r) setHata(r.hata); else degis(r.url);
    };
    return (
      <div>
        {etiket}
        <div className="flex flex-wrap items-center gap-3">
          {s && !s.startsWith("/assets/") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s} alt="" className="h-20 max-w-[220px] rounded-lg border border-border bg-surface object-contain p-1"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          )}
          {s && s.startsWith("/assets/") && <span className="rounded-lg bg-surface px-3 py-2 text-xs text-muted">Sitedeki hazır görsel: {s}</span>}
          <input ref={dosya} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) yukle(f); e.target.value = ""; }} />
          <button type="button" className={btnGhost} disabled={yukleniyor} onClick={() => dosya.current?.click()}>
            <ImagePlus size={16} />{yukleniyor ? "Yükleniyor…" : s ? "Değiştir" : "Görsel yükle"}
          </button>
          {s && <button type="button" className={btnGhost} onClick={() => degis("")}><X size={16} />Kaldır</button>}
        </div>
        {ipucu}
      </div>
    );
  }

  let girdi: React.ReactNode;
  if (a.tip === "lines" || a.tip === "paras") {
    girdi = (
      <textarea className={`${field} ${a.tip === "paras" ? "min-h-48" : "min-h-32"}`} value={ham}
        onChange={(e) => { setHam(e.target.value); degis(metinDizi(e.target.value, a.tip as "lines" | "paras")); }} />
    );
  } else if (a.tip === "textarea") {
    girdi = <textarea className={`${field} min-h-24`} value={s} onChange={(e) => degis(e.target.value)} />;
  } else if (a.tip === "html") {
    girdi = <textarea className={`${field} min-h-[420px] font-mono text-xs leading-relaxed`} value={s} spellCheck={false} onChange={(e) => degis(e.target.value)} />;
  } else if (a.tip === "select") {
    girdi = (
      <select className={field} value={s} onChange={(e) => degis(e.target.value)}>
        {a.secenekler?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  } else if (a.tip === "number") {
    girdi = <input type="number" className={field} value={s} onChange={(e) => degis(e.target.value === "" ? 0 : Number(e.target.value))} />;
  } else {
    girdi = <input type={a.tip === "date" ? "date" : a.tip === "url" ? "url" : "text"} className={field} value={s} onChange={(e) => degis(e.target.value)} />;
  }
  return <label className="block">{etiket}{girdi}{ipucu}</label>;
}

function Alanlar({ alanlar, kayit, degis }: { alanlar: Alan[]; kayit: Kayit; degis: (k: string, v: unknown) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {alanlar.map((a) => (
        <div key={a.k} className={a.genis ? "md:col-span-2" : undefined}>
          <AlanGir a={a} deger={kayit[a.k]} degis={(v) => degis(a.k, v)} />
        </div>
      ))}
    </div>
  );
}

export function KurumsalEditor({ bolum, ilk }: { bolum: Bolum; ilk: unknown }) {
  const [deger, setDeger] = useState<unknown>(ilk);
  const [kayitli, setKayitli] = useState(() => JSON.stringify(ilk));
  const [acik, setAcik] = useState<number | null>(null);
  const [durum, setDurum] = useState<{ ok?: boolean; hata?: string } | null>(null);
  const [bekliyor, basla] = useTransition();
  const [satirlar, setSatirlar] = useState(() => (Array.isArray(ilk) ? (ilk as string[]).join("\n") : ""));
  const degisti = useMemo(() => JSON.stringify(deger) !== kayitli, [deger, kayitli]);

  const liste = Array.isArray(deger) ? (deger as Kayit[]) : [];
  const setListe = (l: Kayit[]) => { setDeger(l); setDurum(null); };

  function kaydet() {
    let son = deger;
    // Boş adresler başlıktan üretilir
    if (bolum.slugAlani && Array.isArray(son)) {
      const { alan, kaynak } = bolum.slugAlani;
      son = (son as Kayit[]).map((x) => ({ ...x, [alan]: slugla(String(x[alan] || x[kaynak] || "")) }));
    }
    if (bolum.tur === "liste") {
      const eksik = (son as Kayit[]).findIndex((x) => bolum.alanlar.some((a) => a.zorunlu && !String(x[a.k] ?? "").trim()));
      if (eksik >= 0) { setAcik(eksik); return setDurum({ hata: `${eksik + 1}. kayıtta zorunlu alan boş.` }); }
    }
    basla(async () => {
      const r = await kurumsalKaydet(bolum.anahtar, JSON.stringify(son));
      if ("hata" in r) return setDurum({ hata: r.hata });
      setDeger(son);
      setKayitli(JSON.stringify(son));
      setDurum({ ok: true });
    });
  }

  const tasi = (i: number, d: number) => {
    const l = [...liste];
    [l[i], l[i + d]] = [l[i + d], l[i]];
    setListe(l);
    setAcik((a) => (a === i ? i + d : a === i + d ? i : a));
  };

  return (
    <div className="space-y-4">
      {bolum.tur === "nesne" && (
        <div className={card}>
          <Alanlar alanlar={bolum.alanlar} kayit={(deger ?? {}) as Kayit} degis={(k, v) => { setDeger({ ...(deger as Kayit), [k]: v }); setDurum(null); }} />
        </div>
      )}

      {bolum.tur === "satirlar" && (
        <div className={card}>
          <textarea className={`${field} min-h-72`} value={satirlar}
            onChange={(e) => { setSatirlar(e.target.value); setDeger(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean)); setDurum(null); }} />
        </div>
      )}

      {bolum.tur === "liste" && (
        <>
          {liste.length === 0 && <p className={`${card} text-sm text-muted`}>Henüz kayıt yok.</p>}
          {liste.map((x, i) => {
            const baslik = String(x[bolum.baslikAlani ?? ""] || "") || "(başlıksız)";
            const ac = acik === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="w-7 text-xs font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => setAcik(ac ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold">
                    <span className="truncate">{baslik.replace(/\*/g, "")}</span>
                    <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${ac ? "rotate-180" : ""}`} />
                  </button>
                  <button type="button" className={iconBtn} disabled={i === 0} onClick={() => tasi(i, -1)} aria-label="Yukarı taşı"><ArrowUp size={16} /></button>
                  <button type="button" className={iconBtn} disabled={i === liste.length - 1} onClick={() => tasi(i, 1)} aria-label="Aşağı taşı"><ArrowDown size={16} /></button>
                  <button type="button" className={`${iconBtn} hover:!text-red-600`} aria-label="Sil"
                    onClick={() => { if (confirm(`"${baslik}" silinsin mi? (Kaydet'e basana kadar sitede değişmez.)`)) { setListe(liste.filter((_, j) => j !== i)); setAcik(null); } }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                {ac && (
                  <div className="border-t border-border p-5">
                    <Alanlar alanlar={bolum.alanlar} kayit={x} degis={(k, v) => setListe(liste.map((y, j) => (j === i ? { ...y, [k]: v } : y)))} />
                    {bolum.slugAlani && (
                      <p className="mt-4 text-xs text-muted">Sayfa: {bolum.slugAlani.onEk}{slugla(String(x[bolum.slugAlani.alan] || x[bolum.slugAlani.kaynak] || "")) || "…"}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" className={btnGhost}
            onClick={() => { setListe([...liste, Object.fromEntries(bolum.alanlar.map((a) => [a.k, bos(a)]))]); setAcik(liste.length); }}>
            <Plus size={16} />{bolum.yeniEtiket ?? "Ekle"}
          </button>
        </>
      )}

      {/* Kaydet çubuğu: sayfanın altına yapışık */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-slate-50/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <button type="button" className={btnPrimary} onClick={kaydet} disabled={bekliyor || !degisti}>
          <Save size={16} />{bekliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {durum?.ok && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700"><CircleCheck size={16} />Kaydedildi. Kurumsal sitede en geç 1 dakika içinde görünür.</span>}
        {durum?.hata && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-700"><CircleAlert size={16} />{durum.hata}</span>}
        {!durum && degisti && <span className="text-sm text-amber-700">Kaydedilmemiş değişiklikler var.</span>}
      </div>
    </div>
  );
}
