// gazamuhendislik.com.tr, kombiklimago.com ve GAZ-A kurumsal sitesi aynı veritabanını kullanır. Markaya özel kayıtlar (slider, vitrin,
// kampanyalar, uygulama bannerları ve tanıtım ekranları, bilgi talepleri, siparişler) "site" sütunuyla ayrılır.
export const SITES = {
  gazamuh: { label: "GAZ-A Mühendislik", url: "https://gazamuhendislik.com.tr" },
  kombiklimago: { label: "Kombi Klima GO", url: "https://kombiklimago.com" },
  // Kurumsal site ayrı projedir (gaza-muhendislik-nextjs); içeriği admin panelinde "Kurumsal Site" bölümünden düzenlenir.
  // Adresi https://gazamuhendislik.com (NEXT_PUBLIC_KURUMSAL_URL ile değiştirilebilir) (menüdeki "Siteyi görüntüle" bağlantısı).
  gazakurumsal: { label: "GAZ-A Kurumsal", url: (process.env.NEXT_PUBLIC_KURUMSAL_URL || "https://gazamuhendislik.com").replace(/\/$/, "") },
} as const;

export type SiteKey = keyof typeof SITES;

// Bu kodun ait olduğu site (gazamuhweb'de "gazamuh")
export const SITE_KEY: SiteKey = "kombiklimago";

export const isSiteKey = (v: unknown): v is SiteKey => typeof v === "string" && v in SITES;
// "site" sütunu eklenmeden önceki kayıtlar GAZ-A'nındır
export const siteOf = (v: unknown): SiteKey => (isSiteKey(v) ? v : "gazamuh");
