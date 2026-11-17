import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";
import { MARKALAR, VARSAYILAN_AYAR, hesapla, para, temizle, type Ayarlar, type Doviz, type Teklif } from "./teklif-tip";

// Teklifler ve teklif ürün kütüphanesi (ortak veritabanı; iki sitenin admin paneli de aynı kayıtları görür).
// - teklifler: her teklif tek satır; kalemler, müşteri ve notlar "veri" sütununda JSON olarak durur.
// - teklif_urunler: tekliflere girilen kalemler; teklif kaydedilince eklenir/güncellenir, yeni teklifte aranıp tekrar kullanılır.
// - teklif ayarları (varsayılan notlar, giriş metni) kurumsal_icerik tablosunda "teklif_ayar" anahtarıyla durur.
let ready = false;
export async function ensureTeklifTables() {
  if (ready) return;
  await db().query(`CREATE TABLE IF NOT EXISTS teklifler (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teklif_no VARCHAR(30) NOT NULL UNIQUE,
    marka VARCHAR(20) NOT NULL,
    durum VARCHAR(20) NOT NULL DEFAULT 'taslak',
    tarih DATE NOT NULL,
    firma VARCHAR(255) NOT NULL DEFAULT '',
    proje VARCHAR(255) NOT NULL DEFAULT '',
    ozet VARCHAR(255) NOT NULL DEFAULT '',
    veri MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tarih (tarih)
  ) CHARACTER SET utf8mb4`);
  await db().query(`CREATE TABLE IF NOT EXISTS teklif_urunler (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tanim VARCHAR(300) NOT NULL,
    marka VARCHAR(100) NOT NULL DEFAULT '',
    birim VARCHAR(20) NOT NULL DEFAULT 'Adet',
    fiyat DECIMAL(16,4) NOT NULL DEFAULT 0,
    doviz VARCHAR(3) NOT NULL DEFAULT 'TL',
    kullanim INT UNSIGNED NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_urun (tanim(180), marka(60))
  ) CHARACTER SET utf8mb4`);
  ready = true;
}

// Toplamların kısa yazımı (listede gösterilir): "6.146,40 EUR + 12.000,00 TL" (KDV dahil)
export function ozet(t: Teklif) {
  const h = hesapla(t);
  return h.dovizler.map((d) => para(h.genel[d], d)).join(" + ").slice(0, 255);
}

export async function teklifGetir(id: number): Promise<Teklif | null> {
  await ensureTeklifTables();
  const [rows] = await db().query<RowDataPacket[]>("SELECT id, teklif_no, veri FROM teklifler WHERE id = ?", [id]);
  if (!rows.length) return null;
  let v: unknown = {};
  try { v = JSON.parse(rows[0].veri); } catch {}
  return { ...temizle(v), id: rows[0].id, no: rows[0].teklif_no };
}

// Teklif numarası: marka ön eki + yıl/ay + o ayın sıra numarası (GZ-2611-001)
async function yeniNo(t: Teklif) {
  const [y, m] = t.tarih.split("-");
  const kok = `${MARKALAR[t.marka].onEk}-${y.slice(2)}${m}-`;
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT MAX(CAST(SUBSTRING(teklif_no, ?) AS UNSIGNED)) AS n FROM teklifler WHERE teklif_no LIKE ?", [kok.length + 1, `${kok}%`]);
  return `${kok}${String((Number(rows[0]?.n) || 0) + 1).padStart(3, "0")}`;
}

export async function teklifKaydetDb(t: Teklif): Promise<{ id: number; no: string }> {
  await ensureTeklifTables();
  const kayit = (no: string) => JSON.stringify({ ...t, id: undefined, no });
  const alanlar = (no: string) => [t.marka, t.durum, t.tarih, t.musteri.firma.slice(0, 255), t.proje.slice(0, 255), ozet(t), kayit(no)];
  let sonuc: { id: number; no: string };
  if (t.id) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT teklif_no FROM teklifler WHERE id = ?", [t.id]);
    if (!rows.length) throw new Error("Teklif bulunamadı.");
    const no = rows[0].teklif_no as string;
    await db().query("UPDATE teklifler SET marka=?, durum=?, tarih=?, firma=?, proje=?, ozet=?, veri=? WHERE id=?", [...alanlar(no), t.id]);
    sonuc = { id: t.id, no };
  } else {
    // Aynı anda iki teklif aynı numarayı almaya çalışırsa ikincisi bir sonraki numarayla tekrar dener
    for (let deneme = 0; ; deneme++) {
      const no = await yeniNo(t);
      try {
        const [r] = await db().query<ResultSetHeader>(
          "INSERT INTO teklifler (marka, durum, tarih, firma, proje, ozet, veri, teklif_no) VALUES (?,?,?,?,?,?,?,?)", [...alanlar(no), no]);
        sonuc = { id: r.insertId, no };
        break;
      } catch (e) {
        if ((e as { code?: string }).code !== "ER_DUP_ENTRY" || deneme > 4) throw e;
      }
    }
  }
  await kutuphaneyeEkle(t, !t.id);
  return sonuc;
}

// Teklifteki kalemleri ürün kütüphanesine işler: yeni ürün eklenir, var olanın fiyatı/birimi son teklifteki gibi güncellenir.
// Kullanım sayısı yalnızca yeni teklifte artar (aynı teklifi tekrar kaydetmek saymaz).
async function kutuphaneyeEkle(t: Teklif, yeniTeklif: boolean) {
  const kalemler = t.gruplar.flatMap((g) => g.kalemler).filter((k) => k.tanim.trim());
  const gorulen = new Set<string>();
  for (const k of kalemler) {
    const anahtar = `${k.tanim.trim().toLocaleLowerCase("tr")}|${k.marka.trim().toLocaleLowerCase("tr")}`;
    if (gorulen.has(anahtar)) continue;
    gorulen.add(anahtar);
    await db().query(
      `INSERT INTO teklif_urunler (tanim, marka, birim, fiyat, doviz) VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE birim=VALUES(birim), fiyat=VALUES(fiyat), doviz=VALUES(doviz), kullanim=kullanim+?`,
      [k.tanim.trim().slice(0, 300), k.marka.trim().slice(0, 100), k.birim, k.fiyat, k.doviz, yeniTeklif ? 1 : 0]);
  }
}

export type KutuphaneUrun = { id: number; tanim: string; marka: string; birim: string; fiyat: number; doviz: Doviz; kaynak: "kutuphane" | "magaza"; kullanim?: number };

// Teklif formundaki ürün arama: önce teklif kütüphanesi, sonra mağaza ürünleri (TL fiyatıyla)
export async function urunAraDb(q: string): Promise<KutuphaneUrun[]> {
  await ensureTeklifTables();
  const kelimeler = q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (!kelimeler.length) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM teklif_urunler ORDER BY updated_at DESC LIMIT 15");
    return rows.map(kutuphaneSatiri);
  }
  const kosul = (alanlar: string) => kelimeler.map(() => `CONCAT_WS(' ', ${alanlar}) LIKE ?`).join(" AND ");
  const degerler = kelimeler.map((k) => `%${k}%`);
  const [lib] = await db().query<RowDataPacket[]>(
    `SELECT * FROM teklif_urunler WHERE ${kosul("tanim, marka")} ORDER BY kullanim DESC, updated_at DESC LIMIT 15`, degerler);
  let magaza: RowDataPacket[] = [];
  try {
    [magaza] = await db().query<RowDataPacket[]>(
      `SELECT id, name, brand, price FROM products WHERE active = 1 AND ${kosul("name, IFNULL(brand,''), IFNULL(sku,'')")} ORDER BY price > 0 DESC, name LIMIT 10`, degerler);
  } catch {}
  return [
    ...lib.map(kutuphaneSatiri),
    ...magaza.map((r) => ({ id: r.id, tanim: r.name, marka: r.brand ?? "", birim: "Adet", fiyat: Number(r.price), doviz: "TL" as Doviz, kaynak: "magaza" as const })),
  ];
}

const kutuphaneSatiri = (r: RowDataPacket): KutuphaneUrun => ({
  id: r.id, tanim: r.tanim, marka: r.marka, birim: r.birim, fiyat: Number(r.fiyat), doviz: r.doviz as Doviz, kaynak: "kutuphane", kullanim: r.kullanim,
});

// Daha önceki tekliflerdeki müşteriler (yeni teklifte firma adı yazılınca bilgileri doldurmak için)
export async function musterilerDb() {
  await ensureTeklifTables();
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT t.veri FROM teklifler t JOIN (SELECT MAX(id) AS id FROM teklifler WHERE firma <> '' GROUP BY firma) s ON s.id = t.id ORDER BY t.id DESC LIMIT 200`);
  return rows.map((r) => {
    try { return temizle(JSON.parse(r.veri)).musteri; } catch { return null; }
  }).filter((m): m is Teklif["musteri"] => !!m && !!m.firma);
}

export async function ayarlarGetir(): Promise<Ayarlar> {
  try {
    await db().query(`CREATE TABLE IF NOT EXISTS kurumsal_icerik (
      anahtar VARCHAR(40) PRIMARY KEY, deger MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) CHARACTER SET utf8mb4`);
    const [rows] = await db().query<RowDataPacket[]>("SELECT deger FROM kurumsal_icerik WHERE anahtar = 'teklif_ayar'");
    if (!rows.length) return VARSAYILAN_AYAR;
    const v = JSON.parse(rows[0].deger) as Partial<Ayarlar>;
    return {
      konu: typeof v.konu === "string" ? v.konu : VARSAYILAN_AYAR.konu,
      giris: typeof v.giris === "string" ? v.giris : VARSAYILAN_AYAR.giris,
      notlar: Array.isArray(v.notlar) ? v.notlar.filter((n): n is string => typeof n === "string") : VARSAYILAN_AYAR.notlar,
    };
  } catch {
    return VARSAYILAN_AYAR;
  }
}

export async function ayarlarKaydetDb(a: Ayarlar) {
  await ayarlarGetir(); // tabloyu oluşturur
  await db().query("INSERT INTO kurumsal_icerik (anahtar, deger) VALUES ('teklif_ayar', ?) ON DUPLICATE KEY UPDATE deger = VALUES(deger)", [JSON.stringify(a)]);
}
