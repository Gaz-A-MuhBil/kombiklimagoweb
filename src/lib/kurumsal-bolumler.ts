// GAZ-A Kurumsal sitesinin (ayrı Next.js projesi) admin panelinden düzenlenen bölümleri.
// Her bölüm ortak veritabanındaki kurumsal_icerik tablosunda tek satırdır (anahtar → JSON).
// Kurumsal site aynı anahtarları okur; alan adları iki tarafta aynı olmalıdır.

export type AlanTip =
  | "text" | "textarea" | "url" | "number" | "date" | "image" | "check"
  | "lines" // her satır bir madde (string[])
  | "paras" // boş satırla ayrılan paragraflar (string[])
  | "html" // blog yazısı gövdesi
  | "select";

export type Alan = { k: string; ad: string; tip: AlanTip; ipucu?: string; secenekler?: string[]; genis?: boolean; zorunlu?: boolean };

export type Bolum = {
  anahtar: string;
  ad: string;
  aciklama: string;
  tur: "nesne" | "liste" | "satirlar";
  alanlar: Alan[];
  baslikAlani?: string; // listede her kaydın başlığı
  slugAlani?: { alan: string; kaynak: string; onEk: string }; // adres (boşsa başlıktan üretilir)
  yeniEtiket?: string;
};

export const BOLUMLER: Bolum[] = [
  {
    anahtar: "firma", ad: "Firma Bilgileri", tur: "nesne",
    aciklama: "Sitenin üst ve alt bilgisinde, iletişim, hakkımızda ve belgeler sayfalarında görünen bilgiler.",
    alanlar: [
      { k: "unvan", ad: "Ticaret unvanı", tip: "text", genis: true },
      { k: "kisaUnvan", ad: "Kısa unvan", tip: "text", genis: true, ipucu: "Alt bilgideki telif satırında ve iletişim sayfasında görünür." },
      { k: "telefon", ad: "Telefon", tip: "text", ipucu: "Örnek: 0533 194 49 52" },
      { k: "whatsapp", ad: "WhatsApp numarası", tip: "text", ipucu: "Başında 90 olacak şekilde, boşluksuz: 905331944952" },
      { k: "eposta", ad: "E-posta", tip: "text" },
      { k: "igdasYetkiNo", ad: "İGDAŞ yetki numarası", tip: "text" },
      { k: "adres", ad: "Adres", tip: "text", genis: true },
      { k: "ilce", ad: "İlçe", tip: "text", ipucu: "Arama motorları için (Google'daki firma bilgisi)." },
      { k: "kurulus", ad: "Kuruluş yılı", tip: "text" },
      { k: "mersis", ad: "MERSİS numarası", tip: "text" },
      { k: "ticaretSicil", ad: "Ticaret sicil numarası", tip: "text" },
      { k: "kep", ad: "KEP adresi", tip: "text" },
      { k: "magaza", ad: "Online mağaza adresi", tip: "url" },
      { k: "linkedin", ad: "LinkedIn", tip: "url", ipucu: "Boş bırakılan hesap sitede gösterilmez." },
      { k: "x", ad: "X (Twitter)", tip: "url" },
      { k: "instagram", ad: "Instagram", tip: "url" },
    ],
  },
  {
    anahtar: "slider", ad: "Slider", tur: "liste", baslikAlani: "baslik", yeniEtiket: "Slayt ekle",
    aciklama: "Ana sayfanın en üstündeki dönen slaytlar. Sıralamayı oklarla değiştirebilirsiniz.",
    alanlar: [
      { k: "ust", ad: "Üst başlık", tip: "text", genis: true, ipucu: "Başlığın üstündeki küçük, büyük harfli satır." },
      { k: "baslik", ad: "Başlık", tip: "text", genis: true, zorunlu: true, ipucu: "Kalın yazılacak kısmı yıldız içine alın: Doğalgazda *mühendislik* güvencesi" },
      { k: "metin", ad: "Metin", tip: "textarea", genis: true },
      { k: "btn1Yazi", ad: "1. düğme yazısı", tip: "text" },
      { k: "btn1Link", ad: "1. düğme bağlantısı", tip: "text", ipucu: "Örnek: /iletisim ya da https://…" },
      { k: "btn2Yazi", ad: "2. düğme yazısı", tip: "text" },
      { k: "btn2Link", ad: "2. düğme bağlantısı", tip: "text" },
    ],
  },
  {
    anahtar: "hizmetler", ad: "Hizmetler", tur: "liste", baslikAlani: "ad", yeniEtiket: "Hizmet ekle",
    slugAlani: { alan: "id", kaynak: "ad", onEk: "/hizmetler/" },
    aciklama: "Faaliyet alanları: ana sayfadaki kartlar, menü, hizmet detay sayfaları ve keşif formundaki liste buradan oluşur.",
    alanlar: [
      { k: "ad", ad: "Hizmet adı", tip: "text", genis: true, zorunlu: true },
      { k: "id", ad: "Sayfa adresi", tip: "text", ipucu: "Boş bırakılırsa addan üretilir. Yayındaki hizmetin adresini değiştirmeyin; eski bağlantılar çalışmaz." },
      { k: "ozet", ad: "Kısa açıklama", tip: "textarea", genis: true, ipucu: "Kartta ve Google açıklamasında görünür." },
      { k: "metin", ad: "Detay metni", tip: "paras", genis: true, ipucu: "Paragrafları boş bir satırla ayırın." },
      { k: "kapsam", ad: "Hizmet kapsamı", tip: "lines", genis: true, ipucu: "Her satır bir madde." },
      { k: "notlar", ad: "Teknik notlar", tip: "lines", genis: true, ipucu: "Her satır bir madde." },
    ],
  },
  {
    anahtar: "surec", ad: "Çalışma Süreci", tur: "liste", baslikAlani: "baslik", yeniEtiket: "Adım ekle",
    aciklama: "Ana sayfadaki numaralı \"Çalışma Sürecimiz\" adımları.",
    alanlar: [
      { k: "baslik", ad: "Adım", tip: "text", genis: true, zorunlu: true },
      { k: "metin", ad: "Açıklama", tip: "textarea", genis: true },
    ],
  },
  {
    anahtar: "sss", ad: "Sık Sorulan Sorular", tur: "liste", baslikAlani: "soru", yeniEtiket: "Soru ekle",
    aciklama: "Hizmetler sayfasının altındaki sorular.",
    alanlar: [
      { k: "soru", ad: "Soru", tip: "text", genis: true, zorunlu: true },
      { k: "cevap", ad: "Cevap", tip: "textarea", genis: true },
    ],
  },
  {
    anahtar: "hakkimizda", ad: "Hakkımızda", tur: "nesne",
    aciklama: "Hakkımızda sayfasının metni ve çalışma ilkeleri. Faaliyet tablosu sayfada sabittir.",
    alanlar: [
      { k: "metin", ad: "Metin", tip: "paras", genis: true, ipucu: "Paragrafları boş bir satırla ayırın." },
      { k: "ilkeler", ad: "Çalışma ilkelerimiz", tip: "lines", genis: true, ipucu: "Her satır bir madde." },
    ],
  },
  {
    anahtar: "projeler", ad: "Projeler", tur: "liste", baslikAlani: "baslik", yeniEtiket: "Proje ekle",
    aciklama: "Projelerimiz sayfası. Proje eklenmeyen bölümde \"Çok Yakında\" kartları görünür.",
    alanlar: [
      { k: "durum", ad: "Durum", tip: "select", secenekler: ["Devam ediyor", "Tamamlandı"] },
      { k: "baslik", ad: "Proje adı", tip: "text", zorunlu: true },
      { k: "konum", ad: "Konum / tür", tip: "text", ipucu: "Örnek: Sancaktepe · Konut" },
      { k: "aciklama", ad: "Açıklama", tip: "textarea", genis: true },
      { k: "gorsel", ad: "Fotoğraf", tip: "image", genis: true, ipucu: "Yatay fotoğraf önerilir (4:3)." },
    ],
  },
  {
    anahtar: "referanslar", ad: "Referanslar", tur: "liste", baslikAlani: "ad", yeniEtiket: "Referans ekle",
    aciklama: "Ana sayfadaki ve referanslar sayfasındaki logolar.",
    alanlar: [
      { k: "ad", ad: "Firma adı", tip: "text", zorunlu: true },
      { k: "yukseklik", ad: "Logo yüksekliği (px)", tip: "number", ipucu: "Geniş logolar için 22–36, kare logolar için 60–80." },
      { k: "logo", ad: "Logo", tip: "image", genis: true, ipucu: "Şeffaf arka planlı PNG önerilir." },
      { k: "gri", ad: "Tek renk (siyah) göster", tip: "check" },
    ],
  },
  {
    anahtar: "markalar", ad: "Markalar", tur: "satirlar", alanlar: [],
    aciklama: "Ana sayfadaki \"Çalıştığımız Markalar\" listesi. Her satıra bir marka yazın.",
  },
  {
    anahtar: "belgeler", ad: "Belgeler", tur: "liste", baslikAlani: "belge", yeniEtiket: "Belge ekle",
    aciklama: "Belgeler sayfasındaki yetki ve bayilik belgeleri tablosu. Şirket künyesi Firma Bilgileri'nden gelir.",
    alanlar: [
      { k: "belge", ad: "Belge", tip: "text", genis: true, zorunlu: true },
      { k: "kurum", ad: "Veren kurum", tip: "text" },
      { k: "durum", ad: "Açıklama", tip: "text" },
      { k: "dosya", ad: "Belge görseli", tip: "image", genis: true, ipucu: "Yüklenirse belge adı bu görsele bağlantı olur." },
    ],
  },
  {
    anahtar: "blog", ad: "Blog Yazıları", tur: "liste", baslikAlani: "baslik", yeniEtiket: "Yazı ekle",
    slugAlani: { alan: "id", kaynak: "baslik", onEk: "/blog/" },
    aciklama: "Kurumsal sitenin blog yazıları (mağaza sitelerinin blogundan ayrıdır). Liste sitede tarihe göre sıralanır.",
    alanlar: [
      { k: "baslik", ad: "Başlık", tip: "text", genis: true, zorunlu: true },
      { k: "id", ad: "Sayfa adresi", tip: "text", ipucu: "Boş bırakılırsa başlıktan üretilir." },
      { k: "kategori", ad: "Kategori", tip: "text", ipucu: "Örnek: Isıtma, Doğalgaz, Klima" },
      { k: "tarih", ad: "Yayın tarihi", tip: "date" },
      { k: "sure", ad: "Okuma süresi (dk)", tip: "number" },
      { k: "ozet", ad: "Özet", tip: "textarea", genis: true, ipucu: "Kartta ve Google açıklamasında görünür (en çok ~155 karakter)." },
      { k: "icerik", ad: "İçerik (HTML)", tip: "html", genis: true, ipucu: "<h2>, <h3>, <p>, <ul>, <a href=\"…\"> etiketleri kullanılabilir." },
    ],
  },
];

export const bolumBul = (anahtar: string) => BOLUMLER.find((b) => b.anahtar === anahtar);
