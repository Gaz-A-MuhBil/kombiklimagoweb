import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, FileText, Mail, Phone, ReceiptText, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { Product } from "@/lib/data";
import { whatsappUrl } from "@/lib/home";
import { contact, igdas } from "@/lib/site";
import { BrandIcon } from "../SocialIcons";
import { BigNumber } from "./BigNumber";
import { CountUp } from "./CountUp";
import { DealsGrid } from "./Deals";
import { Reveal } from "./Reveal";
import { ServicesShowcase } from "./ServicesShowcase";

const wrap = "mx-auto w-full max-w-7xl px-4 md:px-6";
const tel = `tel:+9${contact.phone.replace(/\s/g, "")}`;

// Kurumsal bölüm başlığı: turuncu çizgili üst başlık, kalın başlık, sağda "tümünü gör"
export function Heading({ eyebrow, title, text, href, linkLabel = "Tümünü gör", light = false }: {
  eyebrow?: string; title: string; text?: string; href?: string; linkLabel?: string; light?: boolean;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow mb-3 ${light ? "eyebrow-light" : ""}`}>{eyebrow}</p>}
        <h2 className={`text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl ${light ? "text-white" : "text-primary"}`}>{title}</h2>
        {text && <p className={`mt-3 leading-relaxed ${light ? "text-white/70" : "text-muted"}`}>{text}</p>}
      </div>
      {href && (
        <Link href={href}
          className={`group inline-flex shrink-0 items-center gap-2 rounded-[4px] border px-5 py-2.5 text-sm font-bold transition-colors ${light ? "border-white/30 text-white hover:bg-white hover:text-primary" : "border-border text-primary hover:border-primary hover:bg-primary hover:text-white"}`}>
          {linkLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

const trust = [
  { icon: BadgeCheck, title: igdas.title, text: `Yetki No ${igdas.no}` },
  { icon: Wrench, title: "Ücretsiz Keşif", text: "Yerinde ihtiyaç analizi" },
  { icon: ShieldCheck, title: "Garantili Montaj", text: "Uzman ekip, yetkili servis" },
  { icon: ReceiptText, title: "Faturalı Ürün", text: "Distribütör garantili" },
];

// Slider'ın altında, kısmen üstüne binen güven kartları
export function TrustBar() {
  return (
    <section className={`${wrap} relative z-10 -mt-10 md:-mt-14`}>
      <ul className="grid grid-cols-2 overflow-hidden rounded-[4px] bg-white shadow-[0_20px_50px_-24px_rgba(7,26,46,0.45)] ring-1 ring-border lg:grid-cols-4">
        {trust.map((t, n) => (
          <li key={t.title} className={`flex items-center gap-4 p-5 md:p-7 ${n % 2 ? "border-l" : ""} ${n > 1 ? "border-t lg:border-t-0" : ""} ${n === 2 ? "lg:border-l" : ""} border-border`}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[4px] bg-primary/[0.06] text-accent"><t.icon size={24} strokeWidth={1.8} /></span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-primary md:text-[15px]">{t.title}</span>
              <span className="mt-0.5 block text-xs text-muted md:text-[13px]">{t.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const why = [
  "Keşiften satış sonrası servise kadar tüm süreç tek ekipte",
  "Doğru kapasite ve maliyet hesabı; ihtiyacınız olmayan ürünü satmayız",
  "Önde gelen markaların faturalı ve garantili ürünleri",
  "Doğalgaz projesi, onay ve gaz açma süreçlerinin takibi",
];

// Kurumsal tanıtım: solda görsel ve kuruluş rozeti, sağda metin, maddeler ve rakamlar
export function About({ products, brands, categories }: { products: number; brands: number; categories: number }) {
  const stats = [
    { label: "Ürün çeşidi", node: <CountUp to={products} /> },
    { label: "Marka", node: <CountUp to={brands} /> },
    { label: "Ürün grubu", node: <CountUp to={categories} /> },
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-surface">
            <Image src="/brand/hero.webp" alt="Klima ve kombi ile konforlu yaşam alanı" fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-8 right-4 rounded-[4px] bg-primary px-7 py-6 text-white shadow-xl md:-right-6">
            <p className="text-4xl font-extrabold tabular-nums">2020</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/70">yılından bu yana</p>
          </div>
          <span aria-hidden className="absolute -left-3 -top-3 -z-10 h-32 w-32 rounded-[4px] bg-accent/90" />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow">Kurumsal</p>
          <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-primary md:text-[40px]">
            Isıtma ve soğutmada <span className="text-accent">güvenilir çözüm ortağınız.</span>
          </h2>
          <p className="mt-5 leading-relaxed text-muted">
            Kombi Klima GO; kombi, klima, ısı pompası, radyatör ve şofben gibi ısıtma ve iklimlendirme ürünlerinde satış,
            keşif, projelendirme, montaj ve bakım hizmetlerini tek çatı altında sunar. İstanbul genelinde konut ve iş yerlerine
            mühendislik bakış açısıyla hizmet veriyoruz.
          </p>
          <ul className="mt-7 grid gap-3">
            {why.map((w) => (
              <li key={w} className="flex items-start gap-3 text-[15px] font-medium"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent" />{w}</li>
            ))}
          </ul>
          <dl className="mt-9 grid grid-cols-3 divide-x divide-border rounded-[4px] border border-border">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-5 text-center">
                <dd className="text-3xl font-extrabold tabular-nums text-primary">{s.node}</dd>
                <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/hakkimizda" className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-deep">
              Hakkımızda <ArrowRight size={16} />
            </Link>
            <a href={tel} className="inline-flex items-center gap-2 rounded-[4px] border border-border px-6 py-3.5 text-sm font-bold text-primary transition hover:border-primary">
              <Phone size={16} />{contact.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Deals({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface py-20">
      <div className={wrap}>
        <Heading eyebrow="Fırsatlar" title="Kampanyalı Ürünler" text="Sınırlı stoklu, indirimli modeller." href="/urunler" linkLabel="Tüm ürünler" />
        <DealsGrid products={products} />
      </div>
    </section>
  );
}

// Koyu, tam genişlik bölüm: solda başlık + hizmet listesi, sağda seçili hizmet kartı
export function Services() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(239,107,37,0.18),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className={`${wrap} py-20 lg:py-28`}>
        <ServicesShowcase />
      </div>
    </section>
  );
}

const gasServices = [
  { title: "Proje ve Onay", text: "Doğalgaz projesi çizimi ve İGDAŞ onay süreçlerinin takibi." },
  { title: "Daire İçi Tesisat", text: "Daire içi doğalgaz tesisatı ve kombi montajı." },
  { title: "Kolon Tesisatı", text: "Bina kolon tesisatı ve dönüşüm projeleri." },
  { title: "Gaz Açma", text: "Gaz açma başvurusu ve sızdırmazlık testleri." },
];

// İGDAŞ yetkili bayi: yetki kartı ve dört adımlı süreç
export function Igdas() {
  return (
    <section className="py-20 lg:py-28">
      <div className={wrap}>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="flex items-center gap-7 rounded-[4px] border border-border p-7 md:p-9">
              <Image src={igdas.logo} alt="İGDAŞ" width={250} height={269} className="h-28 w-auto md:h-36" />
              <div>
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-accent"><BadgeCheck size={15} />{igdas.title}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Yetki numarası</p>
                <BigNumber value={igdas.no} className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight text-primary md:text-5xl" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">Doğalgaz</p>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-primary md:text-4xl">
              Doğalgaz projeniz <span className="text-accent">yetkili ellerde.</span>
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Kombi Klima GO, İGDAŞ yetkili bayisi olarak doğalgaz projelerinizi baştan sona yürütür: projelendirme,
              onay, tesisat ve gaz açma süreçlerini sizin yerinize takip ederiz.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/bilgi-al" className="inline-flex items-center rounded-[4px] bg-accent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-bright">
                Doğalgaz projesi için teklif al
              </Link>
              <a href={tel} className="inline-flex items-center gap-2 rounded-[4px] border border-border px-6 py-3.5 text-sm font-bold text-primary transition hover:border-primary">
                <Phone size={16} />{contact.phone}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gasServices.map((g, n) => (
            <Reveal key={g.title} delay={n * 0.06} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-[4px] bg-surface p-7 transition-colors hover:bg-primary">
                <span className="text-sm font-extrabold tabular-nums text-accent">{String(n + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-extrabold text-primary transition-colors group-hover:text-white">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted transition-colors group-hover:text-white/70">{g.text}</p>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export type BrandItem = { name: string; image: string | null };

// Sonsuz kayan şerit: liste ekranı dolduracak kadar çoğaltılır, sonra iki kopya yan yana kaydırılır
function Marquee({ items, reverse = false }: { items: BrandItem[]; reverse?: boolean }) {
  let row = items;
  while (row.length < 10) row = [...row, ...items];
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1} className={`marquee flex shrink-0 gap-4 pr-4 group-hover:[animation-play-state:paused] ${reverse ? "marquee-reverse" : ""}`}
          style={{ animationDuration: `${row.length * 3.5}s` }}>
          {row.map((b, i) => (
            <li key={`${b.name}-${i}`}>
              <Link href={`/urunler?marka=${encodeURIComponent(b.name)}`} tabIndex={copy ? -1 : undefined} title={`${b.name} ürünleri`}
                className="group/b grid h-24 w-44 place-items-center rounded-[4px] border border-border bg-white px-6 transition-colors duration-300 hover:border-accent md:h-28 md:w-52">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.name} loading="lazy"
                    className="max-h-12 max-w-full object-contain opacity-60 grayscale transition duration-300 group-hover/b:opacity-100 group-hover/b:grayscale-0 md:max-h-14" />
                ) : (
                  <span className="text-center text-lg font-extrabold tracking-tight text-primary/40 transition-colors group-hover/b:text-primary">{b.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function Brands({ items }: { items: BrandItem[] }) {
  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);
  const rows = items.length >= 8 ? [items.slice(0, half), items.slice(half)] : [items];
  return (
    <section className="overflow-hidden border-t border-border bg-surface py-20 lg:py-24">
      <div className={wrap}>
        <Heading eyebrow="Çözüm ortaklarımız" title="Çalıştığımız Markalar" text="Sektörün önde gelen üreticilerinin yetkili ürünleri." href="/urunler" linkLabel="Tüm ürünler" />
      </div>
      <div className="space-y-4">
        {rows.map((r, i) => <Marquee key={i} items={r} reverse={i === 1} />)}
      </div>
    </section>
  );
}

const channels = [
  { label: "WhatsApp", note: "Hızlı yanıt", href: whatsappUrl, icon: "whatsapp", external: true },
  { label: "Telefon", note: contact.phone, href: tel, icon: "phone", external: false },
  { label: "E-posta", note: contact.email, href: `mailto:${contact.email}`, icon: "mail", external: false },
  { label: "Teklif formu", note: "Size dönüş yapalım", href: "/bilgi-al", icon: "form", external: false },
] as const;

const channelIcon = {
  whatsapp: <BrandIcon name="whatsapp" size={22} />,
  phone: <Phone size={22} />,
  mail: <Mail size={22} />,
  form: <FileText size={22} />,
};

// Teklif çağrısı: lacivert kart, solda başlık ve buton, sağda iletişim kanalları
export function CtaBand() {
  return (
    <section className={`${wrap} pt-20`}>
      <div className="relative isolate overflow-hidden rounded-[4px] bg-primary px-6 py-12 text-white md:px-12 md:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(239,107,37,0.25),transparent_60%)]" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow eyebrow-light">Ücretsiz keşif</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-[42px]">Projeniz için hemen teklif alın.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/70">
              İhtiyacınızı anlatın, mekânınıza uygun çözümü birlikte belirleyelim. Size en kolay gelen kanaldan ulaşın.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bilgi-al" className="inline-flex items-center gap-2 rounded-[4px] bg-accent px-7 py-4 text-sm font-bold text-white transition hover:bg-accent-bright">
                Teklif iste <ArrowRight size={16} />
              </Link>
              <Link href="/urunler" className="inline-flex items-center gap-2 rounded-[4px] border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:bg-white hover:text-primary">
                <Truck size={16} />Ürünleri incele
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {channels.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined}
                    className="group flex h-full items-center gap-4 rounded-[4px] bg-white/[0.07] p-5 ring-1 ring-white/10 transition-colors hover:bg-white hover:text-primary">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[4px] bg-accent text-white">{channelIcon[c.icon]}</span>
                    <span className="min-w-0">
                      <span className="block font-extrabold">{c.label}</span>
                      <span className="mt-0.5 block truncate text-sm text-white/65 group-hover:text-muted">{c.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
