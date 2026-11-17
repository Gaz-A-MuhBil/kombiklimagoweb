import {
  HAZIRLAYAN, MARKALAR, SIRKET, gecerlilikTarihi, grupKodu, hesapla, para, satirToplam, trTarih, type Teklif,
} from "@/lib/teklif-tip";
import { YazdirCubugu } from "./YazdirCubugu";

// Teklifin yatay A4 baskı / PDF görünümü
export function TeklifBaski({ t, otomatik = true }: { t: Teklif; otomatik?: boolean }) {
  const m = MARKALAR[t.marka];
  const h = hesapla(t);
  const yabanci = h.dovizler.filter((d) => d !== "TL");
  const aciklamaVar = t.gruplar.some((g) => g.kalemler.some((k) => k.aciklama));
  let sira = 0;

  const css = `
    @page { size: A4 landscape; margin: 9mm 10mm 13mm;
      @bottom-left { content: "${SIRKET.unvan.replace(/"/g, "")} · ${SIRKET.telefon} · ${m.web}"; font: 7.5pt Arial, sans-serif; color: #8a94a3; }
      @bottom-right { content: "${(t.no ?? "").replace(/"/g, "")}  ·  Sayfa " counter(page) " / " counter(pages); font: 7.5pt Arial, sans-serif; color: #8a94a3; }
    }
    html, body { background: #e9edf2; }
    .ty { --r: ${m.renk}; --v: ${m.vurgu}; font-family: Arial, Helvetica, sans-serif; color: #17202c; font-size: 9pt; line-height: 1.38;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ty-sayfa { width: 297mm; min-height: 210mm; margin: 16px auto 40px; padding: 9mm 10mm; background: #fff; box-shadow: 0 10px 40px -16px rgba(15,23,42,.35); box-sizing: border-box; }
    .ty-ust { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8mm; padding-bottom: 4mm; border-bottom: 2.5px solid var(--r); }
    .ty-ust img { max-height: 17mm; max-width: 62mm; object-fit: contain; }
    .ty-baslik { text-align: center; }
    .ty-baslik h1 { margin: 0; font-size: 15pt; letter-spacing: .04em; color: var(--r); font-weight: 800; }
    .ty-baslik p { margin: 1.2mm 0 0; font-size: 8.5pt; color: #5d6b7a; }
    .ty-baslik b { color: #17202c; font-family: ui-monospace, Menlo, monospace; }
    .ty-musteri-logo { justify-self: end; text-align: right; }
    .ty-musteri-ad { font-weight: 700; font-size: 11pt; color: var(--r); max-width: 70mm; }
    .ty-bilgi { display: grid; grid-template-columns: 1.25fr 1fr 1fr; gap: 4mm; margin: 4.5mm 0 3.5mm; }
    .ty-kart { border: 1px solid #dde3ea; border-radius: 2.5mm; padding: 2.8mm 3.5mm; break-inside: avoid; }
    .ty-kart h2 { margin: 0 0 1.6mm; font-size: 7.5pt; letter-spacing: .1em; text-transform: uppercase; color: var(--v); font-weight: 800; }
    .ty-kart table { width: 100%; border-collapse: collapse; }
    .ty-kart td { padding: .5mm 0; vertical-align: top; }
    .ty-kart td:first-child { width: 24mm; color: #5d6b7a; }
    .ty-kart .ana { font-weight: 700; font-size: 10pt; }
    .ty-giris { margin: 0 0 3.5mm; color: #3c4756; }
    .ty-tablo { width: 100%; border-collapse: collapse; }
    .ty-tablo thead { display: table-header-group; }
    .ty-tablo th { background: var(--r); color: #fff; font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; padding: 2mm 2mm; text-align: left; }
    .ty-tablo td { padding: 1.6mm 2mm; border-bottom: 1px solid #e6ebf1; vertical-align: top; }
    .ty-tablo tr { break-inside: avoid; }
    .ty-tablo .sag { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .ty-tablo .orta { text-align: center; }
    .ty-tablo .grup td { background: color-mix(in srgb, var(--r) 8%, #fff); color: var(--r); font-weight: 800; border-bottom: 1px solid color-mix(in srgb, var(--r) 25%, #fff); padding-top: 2mm; padding-bottom: 2mm; }
    .ty-tablo .kod { display: inline-grid; place-items: center; width: 5.5mm; height: 5.5mm; border-radius: 1.2mm; background: var(--r); color: #fff; font-size: 8pt; margin-right: 2mm; }
    .ty-tablo .not { display: block; color: #6b7685; font-size: 7.5pt; margin-top: .4mm; }
    .ty-tablo .tanim { font-weight: 600; }
    .ty-alt { display: grid; grid-template-columns: 1fr ${38 + 42 * h.dovizler.length}mm; gap: 6mm; margin-top: 5mm; align-items: start; }
    .ty-notlar { break-inside: avoid; }
    .ty-notlar h3, .ty-banka h3 { margin: 0 0 1.5mm; font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--r); font-weight: 800; }
    .ty-notlar ol { margin: 0; padding-left: 5mm; color: #3c4756; font-size: 8pt; list-style: decimal; }
    .ty-notlar li::marker { color: var(--r); font-weight: 700; }
    .ty-notlar li { margin-bottom: .7mm; }
    .ty-banka { margin-top: 3.5mm; font-size: 8pt; break-inside: avoid; }
    .ty-banka b { font-family: ui-monospace, Menlo, monospace; letter-spacing: .03em; }
    .ty-toplam { border: 1px solid #dde3ea; border-radius: 2.5mm; overflow: hidden; break-inside: avoid; }
    .ty-toplam table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
    .ty-toplam th { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .06em; color: #5d6b7a; text-align: right; padding: 2mm 3mm 1mm; }
    .ty-toplam td { padding: 1.3mm 3mm; text-align: right; white-space: nowrap; }
    .ty-toplam td:first-child { text-align: left; color: #5d6b7a; }
    .ty-toplam .genel td { background: var(--r); color: #fff !important; font-weight: 800; font-size: 10.5pt; padding: 2.4mm 3mm; }
    .ty-toplam .tl td { background: #fff4ef; color: #b42318 !important; font-weight: 800; }
    .ty-imza { display: grid; grid-template-columns: 1fr 1fr; gap: 14mm; margin-top: 7mm; break-inside: avoid; }
    .ty-imza div { border-top: 1px solid #b9c2ce; padding-top: 1.8mm; text-align: center; font-size: 8pt; color: #5d6b7a; min-height: 20mm; }
    .ty-imza b { display: block; color: #17202c; font-size: 9pt; }
    .ty-kunye { margin-top: 5mm; padding-top: 2.5mm; border-top: 1px solid #e6ebf1; text-align: center; font-size: 7.5pt; color: #8a94a3; }
    @media print {
      html, body { background: #fff; }
      .ty-sayfa { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
      .ty-kunye { display: none; }
    }
  `;

  return (
    <div className="ty">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <YazdirCubugu duzenle={`/admin/teklifler/${t.id}`} otomatik={otomatik} />
      <div className="ty-sayfa">
        <header className="ty-ust">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.logo} alt={m.ad} />
          <div className="ty-baslik">
            <h1>{t.konu || "FİYAT TEKLİFİ"}</h1>
            <p>Teklif No <b>{t.no}</b> · {trTarih(t.tarih)}{t.proje && <> · {t.proje}</>}</p>
          </div>
          <div className="ty-musteri-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {t.musteri.logo ? <img src={t.musteri.logo} alt={t.musteri.firma} /> : <div className="ty-musteri-ad">{t.musteri.firma}</div>}
          </div>
        </header>

        <section className="ty-bilgi">
          <div className="ty-kart">
            <h2>Sayın</h2>
            <table><tbody>
              <tr><td>Firma</td><td className="ana">{t.musteri.firma}</td></tr>
              {t.musteri.ilgili && <tr><td>İlgili</td><td>{t.musteri.ilgili}</td></tr>}
              {(t.musteri.telefon || t.musteri.eposta) && <tr><td>İletişim</td><td>{[t.musteri.telefon, t.musteri.eposta].filter(Boolean).join(" · ")}</td></tr>}
              {t.musteri.adres && <tr><td>Adres</td><td>{t.musteri.adres}</td></tr>}
              {t.musteri.vergi && <tr><td>Vergi D. / No</td><td>{t.musteri.vergi}</td></tr>}
            </tbody></table>
          </div>
          <div className="ty-kart">
            <h2>Teklif</h2>
            <table><tbody>
              <tr><td>Teklif No</td><td className="ana">{t.no}</td></tr>
              <tr><td>Tarih</td><td>{trTarih(t.tarih)}</td></tr>
              {t.gecerlilik > 0 && <tr><td>Geçerlilik</td><td>{t.gecerlilik} gün ({gecerlilikTarihi(t.tarih, t.gecerlilik)} tarihine kadar)</td></tr>}
              {t.proje && <tr><td>Proje</td><td>{t.proje}</td></tr>}
            </tbody></table>
          </div>
          <div className="ty-kart">
            <h2>Hazırlayan</h2>
            <table><tbody>
              <tr><td>Ad Soyad</td><td className="ana">{HAZIRLAYAN.ad}</td></tr>
              <tr><td>Firma</td><td>{m.ad}</td></tr>
              <tr><td>Telefon</td><td>{HAZIRLAYAN.telefon}</td></tr>
              <tr><td>E-posta</td><td>{m.eposta}</td></tr>
            </tbody></table>
          </div>
        </section>

        {t.giris && <p className="ty-giris">{t.giris}</p>}

        <table className="ty-tablo">
          <thead>
            <tr>
              <th style={{ width: "9mm" }}>No</th>
              <th>Ürün / Hizmet</th>
              <th style={{ width: "30mm" }}>Marka</th>
              <th className="orta" style={{ width: "18mm" }}>Miktar</th>
              <th className="orta" style={{ width: "16mm" }}>Birim</th>
              <th className="sag" style={{ width: "30mm" }}>Birim Fiyat</th>
              <th className="sag" style={{ width: "34mm" }}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {t.gruplar.map((g, gi) => (
              <GrupSatirlari key={g.id} kod={grupKodu(gi)} ad={g.ad}
                toplam={h.dovizler.filter((d) => h.gruplar[gi][d]).map((d) => para(h.gruplar[gi][d], d)).join(" + ")}
              >
                {g.kalemler.map((k) => {
                  sira++;
                  return (
                    <tr key={k.id}>
                      <td className="orta">{sira}</td>
                      <td><span className="tanim">{k.tanim}</span>{aciklamaVar && k.aciklama && <span className="not">{k.aciklama}</span>}</td>
                      <td>{k.marka}</td>
                      <td className="orta">{k.miktar.toLocaleString("tr-TR", { maximumFractionDigits: 3 })}</td>
                      <td className="orta">{k.birim}</td>
                      <td className="sag">{para(k.fiyat, k.doviz)}</td>
                      <td className="sag"><b>{para(satirToplam(k), k.doviz)}</b></td>
                    </tr>
                  );
                })}
              </GrupSatirlari>
            ))}
          </tbody>
        </table>

        <section className="ty-alt">
          <div>
            {t.notlar.length > 0 && (
              <div className="ty-notlar">
                <h3>Notlar</h3>
                <ol>{t.notlar.map((n, i) => <li key={i}>{n}</li>)}</ol>
              </div>
            )}
            <div className="ty-banka">
              <h3>Banka Bilgileri</h3>
              <div>{SIRKET.banka} · {SIRKET.hesapSahibi}</div>
              <div>IBAN: <b>{SIRKET.iban.replace(/(.{4})/g, "$1 ").trim()}</b></div>
            </div>
          </div>
          <div className="ty-toplam">
            <table>
              {h.dovizler.length > 1 && (
                <thead><tr><th style={{ textAlign: "left" }} />{h.dovizler.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              )}
              <tbody>
                <tr><td>Ara Toplam</td>{h.dovizler.map((d) => <td key={d}>{para(h.ara[d], d)}</td>)}</tr>
                {t.iskonto > 0 && (
                  <>
                    <tr><td>İskonto (%{t.iskonto.toLocaleString("tr-TR")})</td>{h.dovizler.map((d) => <td key={d}>−{para(h.iskonto[d], d)}</td>)}</tr>
                    <tr><td>İskontolu Toplam</td>{h.dovizler.map((d) => <td key={d}>{para(h.net[d], d)}</td>)}</tr>
                  </>
                )}
                <tr><td>KDV (%{t.kdv.toLocaleString("tr-TR")})</td>{h.dovizler.map((d) => <td key={d}>{para(h.kdv[d], d)}</td>)}</tr>
                <tr className="genel"><td>Genel Toplam</td>{h.dovizler.map((d) => <td key={d}>{para(h.genel[d], d)}</td>)}</tr>
                {yabanci.length > 0 && h.tlKarsilik != null && (
                  <tr className="tl">
                    <td style={{ fontSize: "7.5pt" }}>TL Karşılığı (KDV dahil)<br /><span style={{ fontWeight: 400 }}>{yabanci.map((d) => `${d} ${Number(t.kurlar[d as "EUR" | "USD"]).toLocaleString("tr-TR", { minimumFractionDigits: 4 })}`).join(" · ")}</span></td>
                    <td colSpan={h.dovizler.length}>{para(h.tlKarsilik, "TL")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ty-imza">
          <div><b>{m.ad}</b>{HAZIRLAYAN.ad} · Kaşe / İmza</div>
          <div><b>Müşteri Onayı</b>{t.musteri.firma} · Kaşe / İmza / Tarih</div>
        </section>

        <p className="ty-kunye">{SIRKET.unvan} · {SIRKET.vergi} · {SIRKET.adres} · {SIRKET.telefon} · {m.eposta} · {m.web}</p>
      </div>
    </div>
  );
}

function GrupSatirlari({ kod, ad, toplam, children }: { kod: string; ad: string; toplam: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="grup">
        <td colSpan={6}><span className="kod">{kod}</span>{ad || "Bölüm"}</td>
        <td className="sag">{toplam}</td>
      </tr>
      {children}
    </>
  );
}
