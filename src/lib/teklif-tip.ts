// Teklif hazırlama: tipler, marka bilgileri ve tutar hesabı.
// Hem tarayıcıda (teklif formu, Excel çıktısı) hem sunucuda (kayıt, PDF sayfası) kullanılır; veritabanı kodu lib/teklif.ts'dedir.
// Excel çıktısındaki formüller (lib/teklif-excel.ts) buradaki hesapla birebir aynı sonucu verir.
import { bank, company } from "./site";

export const DOVIZLER = ["TL", "EUR", "USD"] as const;
export type Doviz = (typeof DOVIZLER)[number];
export const BIRIMLER = ["Adet", "Set", "Takım", "Metre", "m²", "Kg", "Paket", "Kutu", "Litre", "Saat", "Gün", "Götürü"];

export const DURUMLAR = {
  taslak: { ad: "Taslak", renk: "bg-slate-100 text-slate-600" },
  gonderildi: { ad: "Gönderildi", renk: "bg-blue-50 text-blue-700" },
  onaylandi: { ad: "Onaylandı", renk: "bg-green-50 text-green-700" },
  reddedildi: { ad: "Reddedildi", renk: "bg-red-50 text-red-700" },
} as const;
export type Durum = keyof typeof DURUMLAR;
export const isDurum = (v: unknown): v is Durum => typeof v === "string" && v in DURUMLAR;

// Teklifi hazırlayan (bizim taraf) her teklifte sabittir
export const HAZIRLAYAN = { ad: "Enes Kartal", telefon: "0533 194 49 52" };

export const MARKALAR = {
  gazamuh: {
    ad: "GAZ-A Mühendislik",
    logo: "/teklif/gazamuh.png",
    renk: "#1a3e85",
    vurgu: "#2099d0",
    eposta: "destek@gazamuhendislik.com.tr",
    web: "www.gazamuhendislik.com.tr",
    onEk: "GZ",
  },
  kombiklimago: {
    ad: "Kombi Klima GO",
    logo: "/teklif/kombiklimago.png",
    renk: "#0f2a47",
    vurgu: "#d9561b",
    eposta: "destek@kombiklimago.com",
    web: "www.kombiklimago.com",
    onEk: "KKG",
  },
} as const;
export type MarkaKey = keyof typeof MARKALAR;
export const isMarka = (v: unknown): v is MarkaKey => typeof v === "string" && v in MARKALAR;

// İki marka da aynı şirkete aittir (vergi levhası ve banka bilgileri lib/site.ts'den)
export const SIRKET = {
  unvan: company.title,
  vergi: `${company.taxOffice} · VKN ${company.taxNo}`,
  adres: "Esenşehir Mah. Çetinkaya Sok. No: 1 Ümraniye / İstanbul",
  telefon: "0533 194 49 52",
  banka: bank.name,
  hesapSahibi: bank.holder,
  iban: bank.iban,
};

export type Kalem = {
  id: string;
  tanim: string;
  marka: string;
  miktar: number;
  birim: string;
  fiyat: number;
  doviz: Doviz;
  aciklama: string;
};
export type Grup = { id: string; ad: string; kalemler: Kalem[] };
export type Musteri = { firma: string; ilgili: string; telefon: string; eposta: string; adres: string; vergi: string; logo: string };

export type Teklif = {
  id?: number;
  no?: string;
  marka: MarkaKey;
  durum: Durum;
  tarih: string; // YYYY-AA-GG
  gecerlilik: number; // gün
  konu: string;
  proje: string;
  musteri: Musteri;
  gruplar: Grup[];
  kdv: number; // %
  iskonto: number; // % (genel iskonto, 0 = yok)
  kurlar: { EUR: number | null; USD: number | null }; // girilirse KDV dahil TL karşılığı hesaplanır
  giris: string;
  notlar: string[];
};

export type Ayarlar = { giris: string; notlar: string[]; konu: string };

export const VARSAYILAN_AYAR: Ayarlar = {
  konu: "MEKANİK MALZEME TEKLİFİMİZ",
  giris:
    "Keşif listenizde veya teklif isteğinizde bulunan teknik verilere yönelik teklifimiz aşağıda bilgilerinize sunulmuştur. " +
    "Seçilen cihazlara ait teknik veriler talebiniz doğrultusunda tarafınıza iletilecektir. " +
    "Teklifimiz ile ilgili teknik ve ticari tüm sorularınız için yardımcı olmaktan memnuniyet duyarız.",
  notlar: [
    "Fiyatlarımız EUR, USD ve TL olarak verilmiştir. EUR ve USD kalemler fatura günündeki TCMB döviz satış kuru ile TL olarak faturalandırılır.",
    "Fiyatlarımıza KDV dahil değildir.",
    "Teklifin geçerlilik süresi teklif tarihinden itibaren belirtilen gün kadardır.",
    "Ödeme şekli proje bazlı konuşulacaktır.",
    "Malzemelerin teslim şekli: Nakliye dahil değildir.",
    "Montaj işçiliği, tesisat malzemesi ve vana fiyatları aksi belirtilmedikçe teklif kapsamında değildir.",
    "Yasa gereği ödenmesi gereken her türlü vergi, harç ve fon ile mevzuat değişikliklerinin getireceği ek yükler alıcıya aittir.",
  ],
};

export const yeniId = () => Math.random().toString(36).slice(2, 10);

export const bosKalem = (doviz: Doviz = "TL"): Kalem => ({ id: yeniId(), tanim: "", marka: "", miktar: 1, birim: "Adet", fiyat: 0, doviz, aciklama: "" });

export const bugun = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function yeniTeklif(ayar: Ayarlar, marka: MarkaKey = "gazamuh"): Teklif {
  return {
    marka,
    durum: "taslak",
    tarih: bugun(),
    gecerlilik: 7,
    konu: ayar.konu,
    proje: "",
    musteri: { firma: "", ilgili: "", telefon: "", eposta: "", adres: "", vergi: "", logo: "" },
    gruplar: [{ id: yeniId(), ad: "MALZEME LİSTESİ", kalemler: [bosKalem()] }],
    kdv: 20,
    iskonto: 0,
    kurlar: { EUR: null, USD: null },
    giris: ayar.giris,
    notlar: [...ayar.notlar],
  };
}

// Grup harfi: A, B, C ... Z, AA, AB ...
export const grupKodu = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : grupKodu(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
type Para = Record<Doviz, number>;
const sifir = (): Para => ({ TL: 0, EUR: 0, USD: 0 });

export type Hesap = {
  dovizler: Doviz[]; // teklifte kullanılan para birimleri (TL, EUR, USD sırasıyla)
  gruplar: Para[];
  ara: Para;
  iskonto: Para;
  net: Para;
  kdv: Para;
  genel: Para;
  tlKarsilik: number | null; // kurlar girilmişse KDV dahil toplamın TL karşılığı
};

export const satirToplam = (k: Kalem) => (Number(k.miktar) || 0) * (Number(k.fiyat) || 0);

export function hesapla(t: Pick<Teklif, "gruplar" | "kdv" | "iskonto" | "kurlar">): Hesap {
  const ara = sifir();
  const gruplar = t.gruplar.map((g) => {
    const p = sifir();
    for (const k of g.kalemler) p[k.doviz] += satirToplam(k);
    for (const d of DOVIZLER) ara[d] += p[d];
    return p;
  });
  const kullanilan = new Set(t.gruplar.flatMap((g) => g.kalemler.filter((k) => k.tanim.trim()).map((k) => k.doviz)));
  const dovizler = DOVIZLER.filter((d) => kullanilan.has(d) || ara[d] !== 0);
  if (!dovizler.length) dovizler.push("TL");
  const iskonto = sifir(), net = sifir(), kdv = sifir(), genel = sifir();
  for (const d of DOVIZLER) {
    iskonto[d] = r2((ara[d] * (Number(t.iskonto) || 0)) / 100);
    net[d] = ara[d] - iskonto[d];
    kdv[d] = r2((net[d] * (Number(t.kdv) || 0)) / 100);
    genel[d] = net[d] + kdv[d];
  }
  // TL karşılığı yalnızca kullanılan her döviz için kur girilmişse hesaplanır
  const eksikKur = dovizler.some((d) => d !== "TL" && !(Number(t.kurlar[d]) > 0));
  const yabanci = dovizler.some((d) => d !== "TL");
  const tlKarsilik = yabanci && !eksikKur ? r2(dovizler.reduce((s, d) => s + genel[d] * (d === "TL" ? 1 : Number(t.kurlar[d])), 0)) : null;
  return { dovizler, gruplar, ara, iskonto, net, kdv, genel, tlKarsilik };
}

export const para = (n: number, d: Doviz) =>
  `${(Number(n) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${d}`;

export const trTarih = (s: string) => {
  const [y, m, g] = (s || "").slice(0, 10).split("-");
  return y && m && g ? `${g}.${m}.${y}` : s;
};

export const gecerlilikTarihi = (tarih: string, gun: number) => {
  const d = new Date(`${tarih}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + (Number(gun) || 0));
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

// Gelen JSON'u güvenli bir Teklif nesnesine çevirir (eksik alanlar tamamlanır, değerler sınırlanır)
const str = (v: unknown, max = 500) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);
const num = (v: unknown, min = -1e12, max = 1e12) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : 0;
};
const dov = (v: unknown): Doviz => (DOVIZLER as readonly string[]).includes(v as string) ? (v as Doviz) : "TL";

export function temizle(v: unknown): Teklif {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const m = (o.musteri && typeof o.musteri === "object" ? o.musteri : {}) as Record<string, unknown>;
  const kur = (o.kurlar && typeof o.kurlar === "object" ? o.kurlar : {}) as Record<string, unknown>;
  const logo = str(m.logo, 1_500_000);
  return {
    id: typeof o.id === "number" ? o.id : undefined,
    no: typeof o.no === "string" ? o.no : undefined,
    marka: isMarka(o.marka) ? o.marka : "gazamuh",
    durum: isDurum(o.durum) ? o.durum : "taslak",
    tarih: /^\d{4}-\d{2}-\d{2}$/.test(str(o.tarih)) ? str(o.tarih) : bugun(),
    gecerlilik: Math.round(num(o.gecerlilik, 0, 365)),
    konu: str(o.konu, 200),
    proje: str(o.proje, 250),
    musteri: {
      firma: str(m.firma, 250), ilgili: str(m.ilgili, 120), telefon: str(m.telefon, 60), eposta: str(m.eposta, 160),
      adres: str(m.adres, 400), vergi: str(m.vergi, 160),
      logo: /^data:image\/(png|jpeg|webp);base64,/.test(logo) ? logo : "",
    },
    gruplar: (Array.isArray(o.gruplar) ? o.gruplar : []).slice(0, 60).map((g) => {
      const gg = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
      return {
        id: str(gg.id, 20) || yeniId(),
        ad: str(gg.ad, 200),
        kalemler: (Array.isArray(gg.kalemler) ? gg.kalemler : []).slice(0, 500).map((k) => {
          const kk = (k && typeof k === "object" ? k : {}) as Record<string, unknown>;
          return {
            id: str(kk.id, 20) || yeniId(),
            tanim: str(kk.tanim, 300), marka: str(kk.marka, 100),
            miktar: num(kk.miktar, 0, 1e9), birim: str(kk.birim, 20) || "Adet",
            fiyat: num(kk.fiyat, -1e10, 1e10), doviz: dov(kk.doviz), aciklama: str(kk.aciklama, 300),
          };
        }),
      };
    }),
    kdv: num(o.kdv, 0, 100),
    iskonto: num(o.iskonto, 0, 100),
    kurlar: { EUR: num(kur.EUR, 0, 1e6) || null, USD: num(kur.USD, 0, 1e6) || null },
    giris: str(o.giris, 3000),
    notlar: (Array.isArray(o.notlar) ? o.notlar : []).map((n) => str(n, 1000).trim()).filter(Boolean).slice(0, 40),
  };
}

// Dosya adı: "GZ-2611-003 Acarkent Villa Isıtma Projesi"
export const dosyaAdi = (t: Teklif) =>
  [t.no, t.proje || t.musteri.firma || "Teklif"].filter(Boolean).join(" ").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120);
