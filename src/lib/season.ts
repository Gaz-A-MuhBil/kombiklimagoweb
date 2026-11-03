import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { ensurePricingTables } from "./pricing";
import { nav } from "./site";

/*
  Mevsime göre kategori sırası: header, footer, site haritası ve ana sayfa bölümleri bu sırayı izler.
  Isıtma sezonu Eylül–Mart, soğutma sezonu Nisan–Ağustos. Admin panelinden (Mağaza → Mevsim Sıralaması)
  otomatik yerine elle bir sezon seçilebilir.
*/
export type Season = "isitma" | "sogutma";
export type SeasonMode = "auto" | Season;

export const SEASONS: Record<Season, { label: string; months: string; order: string[] }> = {
  isitma: {
    label: "Isıtma sezonu (kış)",
    months: "Eylül – Mart",
    order: ["Kombi", "Radyatör", "Isı Pompası", "Kazan", "Oda Termostatı", "Sirkülasyon Pompası", "Şofben", "Termosifon", "Klima"],
  },
  sogutma: {
    label: "Soğutma sezonu (yaz)",
    months: "Nisan – Ağustos",
    order: ["Klima", "Isı Pompası", "Şofben", "Termosifon", "Kombi", "Radyatör", "Kazan", "Oda Termostatı", "Sirkülasyon Pompası"],
  },
};

// Türkiye saatine göre ay
export function autoSeason(d = new Date()): Season {
  const month = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: "Europe/Istanbul" }).format(d));
  return month >= 4 && month <= 8 ? "sogutma" : "isitma";
}

export async function getSeasonMode(): Promise<SeasonMode> {
  try {
    await ensurePricingTables(); // shop_settings tablosu
    const [r] = await db().query<RowDataPacket[]>("SELECT v FROM shop_settings WHERE k = 'season_mode'");
    const v = r[0]?.v;
    return v === "isitma" || v === "sogutma" ? v : "auto";
  } catch {
    return "auto";
  }
}

export async function getSeason(): Promise<Season> {
  const mode = await getSeasonMode();
  return mode === "auto" ? autoSeason() : mode;
}

// Kategori adlarını sezon sırasına dizer; listede olmayanlar sona, kendi sıralarıyla
export function seasonRank(season: Season) {
  const order = SEASONS[season].order;
  return (category: string) => {
    const i = order.indexOf(category);
    return i < 0 ? order.length : i;
  };
}

export function sortBySeason<T>(items: T[], season: Season, name: (t: T) => string) {
  const rank = seasonRank(season);
  return [...items].sort((a, b) => rank(name(a)) - rank(name(b)));
}

// Header/footer kategori bağlantıları: "Tüm Ürünler" başta, kategoriler sezona göre
export async function seasonalNav() {
  const season = await getSeason();
  const [all, ...cats] = nav;
  return [all, ...sortBySeason(cats, season, (n) => n.label)];
}

// Metinde (slayt başlığı, kart adı, bağlantı adresi) geçen sezon kategorisi; yoksa null
const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, " ");
export function categoryIn(text: string): string | null {
  const t = ` ${fold(text)} `;
  return SEASONS.isitma.order.find((c) => t.includes(` ${fold(c).trim()} `)) ?? null;
}

// Slayt ve vitrin kartlarını sezona dizer: kategorisi olmayan (genel) öğeler başta kalır,
// kategorili olanlar sezon sırasına göre; aynı sıradakiler kendi düzenini korur
export function sortTextBySeason<T>(items: T[], season: Season, text: (t: T) => string) {
  const rank = seasonRank(season);
  const r = (t: T) => { const c = categoryIn(text(t)); return c ? rank(c) : -1; };
  return [...items].sort((a, b) => r(a) - r(b));
}

// Ana sayfadaki "sezonun ürünü" bölümü: neden şimdi, kapasite rehberi, kısa öneriler
export type SeasonSpotlight = {
  category: string; eyebrow: string; title: string; highlight: string; text: string;
  sizeTitle: string; sizes: { area: string; value: string; q: string }[]; sizeNote: string;
  tips: { title: string; text: string }[];
};

export const SPOTLIGHT: Record<Season, SeasonSpotlight> = {
  isitma: {
    category: "Kombi",
    eyebrow: "Kış sezonu",
    title: "Soğuklar başlamadan",
    highlight: "kombinizi hazırlayın.",
    text: "Isıtma sezonunda montaj ve servis takvimi hızla doluyor. Evinize uygun kapasiteyi şimdi seçin; keşif, montaj ve İGDAŞ gaz açma sürecini sizin yerinize takip edelim.",
    sizeTitle: "Eviniz için kaç kW?",
    sizes: [
      { area: "80 m²'ye kadar", value: "20 kW", q: "20 kw" },
      { area: "80 – 120 m²", value: "24 kW", q: "24 kw" },
      { area: "120 – 160 m²", value: "28 kW", q: "28 kw" },
      { area: "160 m² üzeri", value: "30 – 35 kW", q: "35 kw" },
    ],
    sizeNote: "Yalıtım, kat ve cephe durumuna göre değişir; kesin kapasiteyi ücretsiz keşifte birlikte belirleriz.",
    tips: [
      { title: "Tam yoğuşmalı teknoloji", text: "Baca gazındaki ısıyı geri kazanan yoğuşmalı kombiler aynı konforu daha az doğalgazla sağlar." },
      { title: "Sezon öncesi bakım", text: "Yıllık bakım, kışın ortasında arıza riskini azaltır ve cihazın verimli çalışmasını sağlar." },
      { title: "Oda termostatı", text: "Kablosuz ya da akıllı termostatla evi yalnızca gerektiğinde ısıtır, faturayı kontrol altında tutarsınız." },
    ],
  },
  sogutma: {
    category: "Klima",
    eyebrow: "Yaz sezonu",
    title: "Sıcaklar bastırmadan",
    highlight: "klimanızı seçin.",
    text: "Yaz aylarında montaj takvimi hızla doluyor. Odanıza uygun kapasiteyi şimdi seçin; keşif, montaj ve servis tek ekipten gelsin.",
    sizeTitle: "Odanız için kaç BTU?",
    sizes: [
      { area: "15 – 20 m²", value: "9.000 BTU", q: "9000 btu" },
      { area: "20 – 30 m²", value: "12.000 BTU", q: "12000 btu" },
      { area: "30 – 45 m²", value: "18.000 BTU", q: "18000 btu" },
      { area: "45 – 60 m²", value: "24.000 BTU", q: "24000 btu" },
    ],
    sizeNote: "Güneş alan cephe, tavan yüksekliği ve kişi sayısı ihtiyacı değiştirir; kesin kapasiteyi ücretsiz keşifte belirleriz.",
    tips: [
      { title: "Inverter ve enerji sınıfı", text: "Inverter klimalar devir ayarlayarak çalışır; A++ ve üzeri sınıf uzun vadede elektrikten tasarruf sağlar." },
      { title: "Doğru montaj", text: "İç ve dış ünitenin doğru konumu ve vakumlu montaj, klimanın sessiz ve verimli çalışmasını sağlar." },
      { title: "Sezon öncesi bakım", text: "Filtre temizliği ve gaz kontrolü, serinletme performansını korur ve havayı temiz tutar." },
    ],
  },
};
