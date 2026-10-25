export const WHATSAPP_NUMBER = "905331944952";
// WhatsApp numarası GAZ-A ile ortak; mesajlardaki marka adı hangi siteden yazıldığını gösterir
export const WHATSAPP_MESSAGE = "Merhaba Kombi Klima GO, bilgi almak istiyorum.";

// Header ve footer kategorileri; açılır menü içerikleri ürünlerden otomatik oluşur (lib/menu.ts)
export const nav = [
  { label: "Tüm Ürünler", href: "/urunler" },
  { label: "Klima", href: "/klima" },
  { label: "Kombi", href: "/kombi" },
  { label: "Şofben", href: "/sofben" },
  { label: "Termosifon", href: "/termosifon" },
  { label: "Radyatör", href: "/radyator" },
  { label: "Oda Termostatı", href: "/oda-termostati" },
  { label: "Isı Pompası", href: "/isi-pompasi" },
  { label: "Sirkülasyon Pompası", href: "/sirkulasyon-pompasi" },
];

export const socials = [
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/kombiklimago" },
  { icon: "x", label: "X (Twitter)", href: "https://x.com/kombiklimago" },
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/kombi-klima-go/" },
  { icon: "whatsapp", label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}` },
] as const;

// İGDAŞ yetkisi: header rozeti, footer ve ana sayfa bölümünde gösterilir
export const igdas = { title: "İGDAŞ Yetkili Bayi", no: "7005140", logo: "/brand/igdas.png" };

// Posta kutuları: destek (müşteri iletişimi, bilgi talepleri), siparis (sipariş yazışmaları),
// noreply (yanıt beklenmeyen otomatik e-postalar)
export const mailboxes = {
  destek: "destek@kombiklimago.com",
  siparis: "siparis@kombiklimago.com",
  noreply: "noreply@kombiklimago.com",
};

// Mobil uygulama mağaza bağlantıları (App Store Apple ID: 6818854687, paket: com.kombiklimago.app)
export const appLinks = {
  ios: "https://apps.apple.com/tr/app/id6818854687",
  android: "https://play.google.com/store/apps/details?id=com.kombiklimago.app",
  // iOS uygulaması henüz App Store'da yayında değil (incelemede). Yayına çıkınca true yapın;
  // o zamana kadar App Store butonu "Yakında" olarak pasif görünür.
  iosLive: false,
};

// Ziyaretçiye ekranın ortasında çıkan "Uygulamamızı indirin" penceresi (components/AppPopup.tsx).
// enabled: false yapılırsa pencere tamamen kapanır. Çerez bildirimi yanıtlanmadan açılmaz;
// kapatıldıktan sonra snoozeDays gün boyunca, gösterildiği oturumda da bir daha çıkmaz.
export const appPopup = {
  enabled: true,
  delayMs: 6000, // sayfa açıldıktan sonra bekleme
  scrollPx: 700, // ya da bu kadar kaydırınca
  snoozeDays: 7,
  // Bu yollarda (ve alt sayfalarında) gösterilmez: sepet/sipariş ve yasal metinler
  hidden: [
    "/admin", "/sepet", "/siparis", "/giris", "/uye-ol", "/hesap-silme", "/abonelik",
    "/cerez-politikasi", "/gizlilik-politikasi", "/kvkk-aydinlatma-metni", "/kullanim-kosullari",
    "/mesafeli-satis-sozlesmesi", "/on-bilgilendirme-formu", "/iptal-ve-iade-kosullari", "/teslimat-ve-iade",
  ],
  name: "Kombi Klima GO",
  screens: [
    { src: "/brand/app-home.webp", alt: "Kombi Klima GO uygulaması ana sayfa", width: 540, height: 1200 },
    { src: "/brand/app-campaigns.webp", alt: "Uygulamada kampanyalar ekranı", width: 540, height: 1200 },
  ],
};

export const contact = {
  phone: "0533 194 49 52",
  email: "destek@kombiklimago.com",
  address: "Eyüp Sultan Mah. Merkez Cad. No: 18 A Sancaktepe / İstanbul",
};

export const footerLinks = {
  Kurumsal: [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Blog", href: "/blog" },
    { label: "İletişim", href: "/iletisim" },
    { label: "Bilgi Al", href: "/bilgi-al" },
    { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
    { label: "Site Haritası", href: "/site-haritasi" },
  ],
  "Müşteri Hizmetleri": [
    { label: "Sipariş Takibi", href: "/hesabim" },
    { label: "Teslimat ve İade", href: "/teslimat-ve-iade" },
    { label: "İptal ve İade Koşulları", href: "/iptal-ve-iade-kosullari" },
    { label: "Kurulum ve Servis", href: "/bilgi-al" },
  ],
  Sözleşmeler: [
    { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
    { label: "Ön Bilgilendirme Formu", href: "/on-bilgilendirme-formu" },
    { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { label: "KVKK Aydınlatma Metni", href: "/kvkk-aydinlatma-metni" },
    { label: "Çerez Politikası", href: "/cerez-politikasi" },
  ],
};

// Havale / EFT ile ödeme (kartla ödeme altyapısı hazırlanana kadar); web ve mobilde gösterilir
export const bank = {
  name: "Kuveyt Türk",
  holder: "GAZA MÜHENDİSLİK İNŞAAT TAAHHÜT VE TİCARET LİMİTED ŞİRKETİ",
  iban: "TR490020500009635656700001",
  logo: "/price/kuveytturk.svg",
};
export const ibanGroups = (iban: string) => iban.replace(/(.{4})/g, "$1 ").trim();
export const PAYMENT_SOON = "Kartla ödeme altyapısı hazırlanıyor, yakında hizmetinizde.";

// Ticaret sicil tasdiknamesi ve vergi levhasındaki resmi bilgiler
export const company = {
  title: "GAZA Mühendislik İnşaat Taahhüt ve Ticaret Limited Şirketi",
  taxOffice: "Sultanbeyli Vergi Dairesi",
  taxNo: "3891513900",
  mersis: "0389151390000001",
  tradeRegistryNo: "237673-5",
  registry: "İstanbul Ticaret Sicili Müdürlüğü",
  kep: "gazamuhendislik@hs01.kep.tr",
};
