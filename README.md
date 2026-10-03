# Kombi Klima GO — web sitesi (kombiklimago.com)

gazamuhendislik.com.tr ile **aynı veritabanını** kullanan, aynı özelliklere sahip (mağaza, sepet, sipariş, üyelik,
favoriler, yorumlar, blog, bilgi/teklif formu, bülten, kuponlar, kampanyalar, admin paneli, mobil uygulama API'si)
ancak **ayrı ve daha kurumsal tasarımlı** Next.js sitesi. Kaynak: `../../gazamuhendislik/gazamuhweb`. Mobil uygulama: `../kombiklimagomobil`.

## Kurulum
1. `.env.example` → `.env.local` (sunucuda `.env`). `DB_*` değerleri gazamuhendislik'teki ile **aynı** olmalı.
2. `npm install` → `npm run dev` (http://localhost:3000)
3. Yayın paketi: `npm run package` → `../kombiklimago-web-build.zip`

## Ortak veritabanı notları
- Ürünler, siparişler, üyeler, admin hesapları, slider/vitrin/kampanya içerikleri iki sitede ortaktır.
  Bir sitenin admin panelinde yapılan değişiklik diğerinde de görünür.
- Görseller (`/uploads/...`) veritabanında yol olarak durur, dosyalar sunucu klasöründedir. İki site aynı
  sunucudaysa `UPLOAD_DIR`'i gazamuhendislik ile aynı klasöre verin. Değilse `UPLOAD_FALLBACK_URL` sayesinde
  burada bulunmayan görseller gazamuhendislik.com.tr'den gösterilir (bu sitenin adminine yüklenenler ise yalnızca bu sunucuda kalır).
- Katalog düzeltme / kazıma / içe aktarma betikleri bilerek burada yok; onlar yalnızca gazamuhweb'den çalıştırılır.

## Tasarım
- Renkler `src/app/globals.css` (`--primary` lacivert, `--accent` turuncu), yazı tipi Manrope (`src/app/fonts`).
- Marka/iletişim bilgileri: `src/lib/site.ts`, `src/lib/seo.ts`, `src/lib/policy.ts`.
- Eski statik tanıtım sitesi `_eski-statik/` klasöründe yedektir.
