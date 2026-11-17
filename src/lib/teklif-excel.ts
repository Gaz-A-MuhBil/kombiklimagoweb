// Teklifin Excel çıktısı (tarayıcıda üretilir; exceljs yalnızca "Excel indir"e basılınca yüklenir).
// İki sayfa: "Teklif" (kapak, özet, toplamlar, notlar) ve "Detay" (kalem kalem liste).
// Bütün tutarlar formüldür: Excel'de miktar, fiyat, döviz, iskonto, KDV oranı ya da kur değiştirilirse her şey yeniden hesaplanır.
import type { Borders, Cell, Fill, Font, Workbook, Worksheet } from "exceljs";
import {
  DOVIZLER, HAZIRLAYAN, MARKALAR, SIRKET, dosyaAdi, gecerlilikTarihi, grupKodu, hesapla, satirToplam, trTarih,
  type Doviz, type Teklif,
} from "./teklif-tip";

const FONT = "Arial";
const argb = (hex: string) => `FF${hex.replace("#", "").toUpperCase()}`;
const ince = { style: "thin" as const, color: { argb: "FFBFC7D5" } };
const kenar: Partial<Borders> = { top: ince, left: ince, bottom: ince, right: ince };
const dolgu = (hex: string): Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: argb(hex) } });
const SAYI = "#,##0.00";
const dovizBicim = (d: Doviz) => `#,##0.00 "${d}"`;
const GIRDI = "FF1F4FD8"; // Excel'de değiştirilebilecek değerler (miktar, fiyat, oranlar, kurlar) mavi yazılır

function yaz(c: Cell, v: unknown, o: { b?: boolean; sz?: number; renk?: string; hiza?: "left" | "center" | "right"; sar?: boolean; bicim?: string; italik?: boolean } = {}) {
  if (v !== undefined) c.value = v as Cell["value"];
  const f: Partial<Font> = { name: FONT, size: o.sz ?? 9, bold: !!o.b, italic: !!o.italik };
  if (o.renk) f.color = { argb: o.renk.startsWith("FF") ? o.renk : argb(o.renk) };
  c.font = f;
  c.alignment = { horizontal: o.hiza ?? "left", vertical: "middle", wrapText: !!o.sar };
  if (o.bicim) c.numFmt = o.bicim;
  return c;
}

export type ExcelGorsel = { base64: string; ext: "png" | "jpeg"; w: number; h: number } | null;

// Görseli Excel'e eklenebilir biçime (png) getirir (tarayıcıda)
async function gorsel(src: string): Promise<ExcelGorsel> {
  try {
    const blob = src.startsWith("data:") ? await (await fetch(src)).blob() : await (await fetch(src, { cache: "force-cache" })).blob();
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width; canvas.height = bmp.height;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0);
    const url = canvas.toDataURL("image/png");
    return { base64: url, ext: "png", w: bmp.width, h: bmp.height };
  } catch {
    return null;
  }
}

function resimKoy(wb: Workbook, ws: Worksheet, g: ExcelGorsel, col: number, row: number, maxW: number, maxH: number, sagaYasla = 0) {
  if (!g) return;
  const k = Math.min(maxW / g.w, maxH / g.h);
  const w = g.w * k, h = g.h * k;
  const id = wb.addImage({ base64: g.base64, extension: g.ext });
  // sağa yaslama: kutunun genişliği (piksel) verilirse sol kenar kaydırılır (sütun genişliği ≈ 7 px/birim)
  const kayma = sagaYasla ? Math.max(0, (sagaYasla - w) / 7 / (ws.getColumn(col + 1).width ?? 10)) : 0;
  ws.addImage(id, { tl: { col: col + kayma, row }, ext: { width: w, height: h }, editAs: "oneCell" });
}

const satirYuksekligi = (metin: string, karakter: number, satir = 12.5) => Math.max(15, Math.ceil(Math.max(1, metin.length) / karakter) * satir + 3);

// Tarayıcıda: logoları yükler, çalışma kitabını kurar ve dosyayı indirir
export async function teklifExcel(t: Teklif) {
  const ExcelJS = (await import("exceljs")).default;
  const [markaLogo, musteriLogo] = await Promise.all([gorsel(MARKALAR[t.marka].logo), t.musteri.logo ? gorsel(t.musteri.logo) : Promise.resolve(null)]);
  const wb = teklifCalismaKitabi(new ExcelJS.Workbook(), t, markaLogo, musteriLogo);
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${dosyaAdi(t)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// Çalışma kitabını kurar (tarayıcıya bağlı değildir)
export function teklifCalismaKitabi(wb: Workbook, t: Teklif, markaLogo: ExcelGorsel, musteriLogo: ExcelGorsel) {
  const m = MARKALAR[t.marka];
  const h = hesapla(t);
  wb.creator = m.ad;
  wb.created = new Date();
  wb.calcProperties.fullCalcOnLoad = true;

  // Sayfa sırası: Teklif, Detay (Teklif'in formülleri Detay'daki satırlara bağlandığı için önce Detay doldurulur)
  const ts = wb.addWorksheet("Teklif", {
    views: [{ showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.5, header: 0.3, footer: 0.3 } },
    headerFooter: { oddFooter: `&C&8${SIRKET.unvan} · ${SIRKET.telefon} · ${m.web}` },
  });

  // ───────────── DETAY ─────────────
  const ds = wb.addWorksheet("Detay", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 6 }],
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.3, footer: 0.3 } },
    headerFooter: { oddFooter: `&L&8${t.no ?? ""}  ${t.proje || t.musteri.firma}&R&8Sayfa &P / &N` },
  });
  ds.columns = [
    { width: 7 }, { width: 58 }, { width: 16 }, { width: 10 }, { width: 9 }, { width: 15 }, { width: 8 }, { width: 18 }, { width: 34 },
  ];
  for (let r = 1; r <= 4; r++) ds.getRow(r).height = 16;
  resimKoy(wb, ds, markaLogo, 0, 0, 230, 58);
  resimKoy(wb, ds, musteriLogo, 7, 0, 150, 58, 160);
  ds.mergeCells("C2:G3");
  yaz(ds.getCell("C2"), `${t.konu || "FİYAT TEKLİFİ"}${t.no ? `  ·  ${t.no}` : ""}`, { b: true, sz: 12, renk: m.renk, hiza: "center" });

  const basliklar = ["No", "Ürün / Hizmet Tanımı", "Marka", "Miktar", "Birim", "Birim Fiyat", "Döviz", "Toplam", "Açıklama"];
  const hb = ds.getRow(6);
  basliklar.forEach((b, i) => {
    const c = hb.getCell(i + 1);
    yaz(c, b, { b: true, renk: "FFFFFFFF", hiza: i === 1 || i === 8 ? "left" : "center" });
    c.fill = dolgu(m.renk); c.border = kenar;
  });
  hb.height = 22;
  ds.autoFilter = "A6:I6";

  let r = 8;
  const grupAralik: { ilk: number; son: number }[] = [];
  let sira = 0;
  t.gruplar.forEach((g, gi) => {
    const kod = grupKodu(gi);
    const gr = ds.getRow(r);
    yaz(gr.getCell(1), kod, { b: true, sz: 10, renk: m.renk, hiza: "center" });
    ds.mergeCells(r, 2, r, 9);
    yaz(gr.getCell(2), g.ad || `${kod} GRUBU`, { b: true, sz: 10, renk: m.renk });
    for (let c = 1; c <= 9; c++) { gr.getCell(c).fill = dolgu("#EEF2F8"); gr.getCell(c).border = { bottom: ince }; }
    gr.height = 20;
    r++;
    const ilk = r;
    for (const k of g.kalemler) {
      sira++;
      const row = ds.getRow(r);
      yaz(row.getCell(1), sira, { hiza: "center" });
      yaz(row.getCell(2), k.tanim, { sar: true });
      yaz(row.getCell(3), k.marka, { hiza: "center" });
      yaz(row.getCell(4), k.miktar, { hiza: "center", renk: GIRDI, bicim: "#,##0.##" });
      yaz(row.getCell(5), k.birim, { hiza: "center" });
      yaz(row.getCell(6), k.fiyat, { hiza: "right", renk: GIRDI, bicim: SAYI });
      yaz(row.getCell(7), k.doviz, { hiza: "center", renk: GIRDI });
      row.getCell(7).dataValidation = { type: "list", allowBlank: false, formulae: ['"TL,EUR,USD"'], showErrorMessage: true, errorTitle: "Döviz", error: "TL, EUR ya da USD seçin." };
      yaz(row.getCell(8), { formula: `D${r}*F${r}`, result: satirToplam(k) }, { hiza: "right", bicim: SAYI, b: true });
      yaz(row.getCell(9), k.aciklama, { sar: true, sz: 8, renk: "FF5D6B7A" });
      for (let c = 1; c <= 9; c++) row.getCell(c).border = { bottom: { style: "hair", color: { argb: "FFD5DBE5" } } };
      row.height = Math.max(satirYuksekligi(k.tanim, 64), satirYuksekligi(k.aciklama, 40, 11));
      r++;
    }
    const son = Math.max(ilk, r - 1);
    grupAralik.push({ ilk, son });
    // grup ara toplamları (grupta kullanılan her döviz için)
    const kullanilan = DOVIZLER.filter((d) => g.kalemler.some((k) => k.doviz === d));
    for (const d of kullanilan.length ? kullanilan : (["TL"] as Doviz[])) {
      const row = ds.getRow(r);
      ds.mergeCells(r, 2, r, 6);
      yaz(row.getCell(2), `${kod} - ${g.ad || "Grup"} Toplamı`, { b: true, hiza: "right", renk: m.renk });
      yaz(row.getCell(7), d, { b: true, hiza: "center", renk: m.renk });
      yaz(row.getCell(8), { formula: `SUMIF(G${ilk}:G${son},"${d}",H${ilk}:H${son})`, result: h.gruplar[gi][d] }, { b: true, hiza: "right", bicim: SAYI, renk: m.renk });
      row.getCell(8).border = { top: { style: "thin", color: { argb: argb(m.renk) } } };
      r++;
    }
    r++;
  });

  // ───────────── TEKLİF (kapak) ─────────────
  ts.columns = [{ width: 2 }, { width: 15 }, { width: 44 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 2 }];
  for (let i = 1; i <= 5; i++) ts.getRow(i).height = 15;
  resimKoy(wb, ts, markaLogo, 1, 0.3, 240, 66);
  resimKoy(wb, ts, musteriLogo, 4, 0.3, 160, 66, 250);

  let tr = 7;
  ts.mergeCells(tr, 2, tr, 6);
  const baslik = yaz(ts.getCell(tr, 2), t.konu || "FİYAT TEKLİFİ", { b: true, sz: 13, renk: "FFFFFFFF", hiza: "center" });
  baslik.fill = dolgu(m.renk);
  ts.getRow(tr).height = 26;
  tr += 2;

  // Müşteri (sol) ve teklif bilgileri (sağ)
  const sol: [string, string][] = [
    ["Firma", t.musteri.firma], ["İlgili", t.musteri.ilgili], ["Telefon", t.musteri.telefon],
    ["E-posta", t.musteri.eposta], ["Adres", t.musteri.adres], ["Vergi D. / No", t.musteri.vergi],
  ];
  const sag: [string, string][] = [
    ["Teklif No", t.no ?? ""], ["Tarih", trTarih(t.tarih)],
    ["Geçerlilik", t.gecerlilik ? `${t.gecerlilik} gün (${gecerlilikTarihi(t.tarih, t.gecerlilik)})` : ""],
    ["Proje", t.proje], ["Hazırlayan", HAZIRLAYAN.ad], ["İletişim", `${HAZIRLAYAN.telefon} · ${m.eposta}`],
  ];
  yaz(ts.getCell(tr, 2), "MÜŞTERİ", { b: true, renk: m.vurgu });
  yaz(ts.getCell(tr, 4), "TEKLİF BİLGİLERİ", { b: true, renk: m.vurgu });
  tr++;
  const bilgiIlk = tr;
  for (let i = 0; i < sol.length; i++) {
    const row = ts.getRow(tr);
    yaz(row.getCell(2), `${sol[i][0]} :`, { b: true, renk: "FF5D6B7A" });
    yaz(row.getCell(3), sol[i][1], { sar: true, b: i === 0 });
    yaz(row.getCell(4), `${sag[i][0]} :`, { b: true, renk: "FF5D6B7A" });
    ts.mergeCells(tr, 5, tr, 6);
    yaz(row.getCell(5), sag[i][1], { sar: true, b: i === 0 });
    row.height = Math.max(satirYuksekligi(sol[i][1], 50), satirYuksekligi(sag[i][1], 40));
    tr++;
  }
  for (let rr = bilgiIlk; rr < tr; rr++) for (let c = 2; c <= 6; c++) ts.getCell(rr, c).border = { bottom: { style: "hair", color: { argb: "FFD5DBE5" } } };
  tr++;

  if (t.giris) {
    ts.mergeCells(tr, 2, tr, 6);
    yaz(ts.getCell(tr, 2), t.giris, { sar: true });
    ts.getRow(tr).height = satirYuksekligi(t.giris, 115);
    tr += 2;
  }

  // Özet tablo: grup başına her dövizin toplamı (Detay sayfasından formülle)
  const dov = h.dovizler;
  const dCol = (i: number) => 7 - dov.length + i; // dövizler sağdan dizilir (F, E, D)
  const harf = (c: number) => String.fromCharCode(64 + c);
  const ozetBas = ts.getRow(tr);
  yaz(ozetBas.getCell(2), "No", { b: true, renk: "FFFFFFFF", hiza: "center" });
  yaz(ozetBas.getCell(3), "Açıklama", { b: true, renk: "FFFFFFFF" });
  dov.forEach((d, i) => yaz(ozetBas.getCell(dCol(i)), `Tutar (${d})`, { b: true, renk: "FFFFFFFF", hiza: "right" }));
  for (let c = 2; c <= 6; c++) ozetBas.getCell(c).fill = dolgu(m.renk);
  ozetBas.height = 20;
  tr++;
  const ozetIlk = tr;
  t.gruplar.forEach((g, gi) => {
    const row = ts.getRow(tr);
    const { ilk, son } = grupAralik[gi];
    yaz(row.getCell(2), grupKodu(gi), { b: true, hiza: "center" });
    yaz(row.getCell(3), g.ad, { b: true });
    dov.forEach((d, i) =>
      yaz(row.getCell(dCol(i)), { formula: `SUMIF(Detay!G${ilk}:G${son},"${d}",Detay!H${ilk}:H${son})`, result: h.gruplar[gi][d] }, { hiza: "right", bicim: dovizBicim(d) }));
    for (let c = 2; c <= 6; c++) row.getCell(c).border = { bottom: ince };
    row.height = 18;
    tr++;
  });
  const ozetSon = tr - 1;
  tr++;

  // Toplamlar: oranlar B sütununda (mavi) değiştirilebilir
  const toplamSatiri = (etiket: string, f: (d: Doviz, col: string) => string, sonuc: (d: Doviz) => number, o: { b?: boolean; oran?: number; dolgulu?: boolean } = {}) => {
    const row = ts.getRow(tr);
    if (o.oran !== undefined) {
      const c = yaz(row.getCell(2), o.oran / 100, { hiza: "center", renk: GIRDI, b: true, bicim: "0.##%" });
      c.note = "Oranı buradan değiştirebilirsiniz; toplamlar yeniden hesaplanır.";
    }
    if (dCol(0) - 1 > 3) ts.mergeCells(tr, 3, tr, dCol(0) - 1);
    yaz(row.getCell(3), etiket, { b: true, hiza: "right", sz: o.b ? 10 : 9 });
    dov.forEach((d, i) => {
      const c = row.getCell(dCol(i));
      yaz(c, { formula: f(d, harf(dCol(i))), result: sonuc(d) }, { b: true, hiza: "right", bicim: dovizBicim(d), sz: o.b ? 10 : 9, renk: o.dolgulu ? "FFFFFFFF" : undefined });
      if (o.dolgulu) c.fill = dolgu(m.renk);
    });
    row.height = o.b ? 20 : 17;
    return tr++;
  };
  // etiket C sütunundan ilk döviz sütununa kadar birleşir (3 dövizde yalnızca C)
  const ara = toplamSatiri("ARA TOPLAM :", (_d, c) => `SUM(${c}${ozetIlk}:${c}${ozetSon})`, (d) => h.ara[d]);
  const isk = toplamSatiri("İSKONTO :", (_d, c) => `-ROUND(${c}${ara}*$B${tr},2)`, (d) => -h.iskonto[d], { oran: t.iskonto });
  const net = toplamSatiri("İSKONTOLU TOPLAM :", (_d, c) => `${c}${ara}+${c}${isk}`, (d) => h.net[d]);
  const kdv = toplamSatiri("KDV :", (_d, c) => `ROUND(${c}${net}*$B${tr},2)`, (d) => h.kdv[d], { oran: t.kdv });
  // iskonto yoksa iskonto satırları gizlenir (formüller çalışır; satırlar açılıp oran girilebilir)
  if (!t.iskonto) { ts.getRow(isk).hidden = true; ts.getRow(net).hidden = true; }
  const genel = toplamSatiri("GENEL TOPLAM (KDV DAHİL) :", (_d, c) => `${c}${net}+${c}${kdv}`, (d) => h.genel[d], { b: true, dolgulu: true });
  tr++;

  // Döviz kalemleri varsa: kurlar (mavi, değiştirilebilir) ve KDV dahil TL karşılığı
  const yabanci = dov.filter((d) => d !== "TL");
  if (yabanci.length) {
    const kurSatir: Partial<Record<Doviz, number>> = {};
    for (const d of yabanci) {
      const row = ts.getRow(tr);
      ts.mergeCells(tr, 3, tr, 5);
      yaz(row.getCell(3), `${d} kuru (TCMB döviz satış; boş bırakılırsa TL karşılığı hesaplanmaz) :`, { hiza: "right", italik: true, sz: 8, renk: "FF5D6B7A" });
      yaz(row.getCell(6), t.kurlar[d as "EUR" | "USD"] ?? null, { hiza: "right", renk: GIRDI, b: true, bicim: "#,##0.0000" });
      row.getCell(6).border = kenar;
      kurSatir[d] = tr++;
    }
    const row = ts.getRow(tr);
    ts.mergeCells(tr, 3, tr, 5);
    yaz(row.getCell(3), "TOPLAM TL KARŞILIĞI (KDV DAHİL) :", { b: true, hiza: "right", sz: 10, renk: "FFC00000" });
    const parca = dov.map((d) => {
      const c = harf(dCol(dov.indexOf(d)));
      return d === "TL" ? `${c}${genel}` : `${c}${genel}*$F$${kurSatir[d]}`;
    });
    const bos = yabanci.map((d) => `$F$${kurSatir[d]}=""`).join(",");
    yaz(row.getCell(6), { formula: `IF(OR(${bos}${yabanci.length === 1 ? ",FALSE" : ""}),"",ROUND(${parca.join("+")},2))`, result: h.tlKarsilik ?? "" }, { b: true, hiza: "right", sz: 10, bicim: dovizBicim("TL"), renk: "FFC00000" });
    row.getCell(6).border = kenar;
    row.height = 20;
    tr += 2;
  }

  // Notlar
  if (t.notlar.length) {
    yaz(ts.getCell(tr, 2), "NOTLAR", { b: true, sz: 10, renk: m.renk });
    tr++;
    t.notlar.forEach((n, i) => {
      yaz(ts.getCell(tr, 2), `${i + 1} -`, { hiza: "right", b: true });
      ts.mergeCells(tr, 3, tr, 6);
      yaz(ts.getCell(tr, 3), n, { sar: true });
      ts.getRow(tr).height = satirYuksekligi(n, 100);
      tr++;
    });
    tr++;
  }

  // Banka bilgileri
  yaz(ts.getCell(tr, 2), "BANKA BİLGİLERİ", { b: true, sz: 10, renk: m.renk });
  tr++;
  for (const [a, v] of [["Banka", SIRKET.banka], ["Hesap Sahibi", SIRKET.hesapSahibi], ["IBAN", SIRKET.iban.replace(/(.{4})/g, "$1 ").trim()]]) {
    yaz(ts.getCell(tr, 2), `${a} :`, { b: true, renk: "FF5D6B7A" });
    ts.mergeCells(tr, 3, tr, 6);
    yaz(ts.getCell(tr, 3), v, { b: a === "IBAN" });
    tr++;
  }
  tr++;

  // İmza alanları
  yaz(ts.getCell(tr, 3), `${m.ad}\n${HAZIRLAYAN.ad}`, { b: true, hiza: "center", sar: true });
  ts.mergeCells(tr, 5, tr, 6);
  yaz(ts.getCell(tr, 5), `Müşteri Onayı\n${t.musteri.firma}`, { b: true, hiza: "center", sar: true });
  ts.getRow(tr).height = 30;
  tr++;
  yaz(ts.getCell(tr, 3), "Kaşe / İmza", { hiza: "center", sz: 8, renk: "FF5D6B7A" });
  ts.mergeCells(tr, 5, tr, 6);
  yaz(ts.getCell(tr, 5), "Kaşe / İmza / Tarih", { hiza: "center", sz: 8, renk: "FF5D6B7A" });
  ts.getRow(tr).height = 48;
  ts.getCell(tr, 3).border = { bottom: ince };
  ts.getCell(tr, 5).border = { bottom: ince };
  tr += 2;

  ts.mergeCells(tr, 2, tr, 6);
  yaz(ts.getCell(tr, 2), `${SIRKET.unvan} · ${SIRKET.vergi}`, { hiza: "center", sz: 8, renk: "FF7F7F7F" });
  tr++;
  ts.mergeCells(tr, 2, tr, 6);
  yaz(ts.getCell(tr, 2), `${SIRKET.adres} · ${SIRKET.telefon} · ${m.eposta} · ${m.web}`, { hiza: "center", sz: 8, renk: "FF7F7F7F" });

  ts.pageSetup.printArea = `A1:G${tr}`;
  return wb;
}
