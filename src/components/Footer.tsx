import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, LockKeyhole, Mail, MapPin, Phone } from "lucide-react";
import { company, contact, footerLinks, igdas } from "@/lib/site";
import { Newsletter } from "./Newsletter";
import { SocialIcons } from "./SocialIcons";

const cards = [
  { name: "Visa", src: "/price/visa.svg", w: 60, h: 20 },
  { name: "Mastercard", src: "/price/mastercard.svg", w: 40, h: 25 },
  { name: "Troy", src: "/price/troy.png", w: 50, h: 24 },
];

const info = [
  ["Ticaret Ünvanı", company.title],
  ["Vergi Dairesi / No", `${company.taxOffice} · ${company.taxNo}`],
  ["MERSİS No", company.mersis],
  ["Ticaret Sicil No", `${company.tradeRegistryNo} · ${company.registry}`],
  ["KEP Adresi", company.kep],
  ["İGDAŞ Yetki No", igdas.no],
];

const tel = `tel:+9${contact.phone.replace(/\s/g, "")}`;

// Koyu lacivert kurumsal alt bilgi. cats: mevsime göre sıralı kategori bağlantıları (lib/season)
export function Footer({ cats }: { cats: { label: string; href: string }[] }) {
  return (
    <footer className="mt-20 bg-primary-deep text-white/70">
      <Newsletter />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 md:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-white.png" alt="Kombi Klima GO" width={1200} height={242} className="h-12 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Isıtma, soğutma ve iklimlendirme sistemlerinde satış, keşif, projelendirme, montaj ve bakım hizmetleri. {company.title} markasıdır.
          </p>
          <ul className="mt-7 space-y-3.5 text-sm">
            <li><a href={tel} className="flex items-center gap-3 font-bold text-white hover:text-accent-bright"><span className="grid h-9 w-9 place-items-center rounded-[4px] bg-white/10"><Phone size={16} /></span>{contact.phone}</a></li>
            <li><a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-white"><span className="grid h-9 w-9 place-items-center rounded-[4px] bg-white/10"><Mail size={16} /></span>{contact.email}</a></li>
            <li className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-white/10"><MapPin size={16} /></span><span className="pt-2">{contact.address}</span></li>
          </ul>
        </div>

        <FooterCol title="Ürünler" items={cats} />
        {Object.entries(footerLinks).slice(0, 2).map(([title, items]) => <FooterCol key={title} title={title} items={items} />)}
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 border-t border-white/10 py-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-12">
          <div className="flex items-center gap-4 rounded-[4px] bg-white px-4 py-3 text-foreground">
            <Image src={igdas.logo} alt="İGDAŞ" width={250} height={269} className="h-12 w-auto" />
            <div className="leading-tight">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-primary"><BadgeCheck size={15} className="text-accent" />{igdas.title}</p>
              <p className="mt-1 text-xs text-muted">Yetki No: <span className="font-bold tabular-nums text-foreground">{igdas.no}</span></p>
            </div>
          </div>
          <dl className="grid gap-x-8 gap-y-4 text-xs sm:grid-cols-2 xl:grid-cols-3">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold uppercase tracking-wider text-white/45">{k}</dt>
                <dd className="mt-1 font-semibold text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 lg:items-end">
            <p className="text-xs font-bold uppercase tracking-wider text-white/45">Bizi takip edin</p>
            <SocialIcons itemClass="h-10 w-10 bg-white/10 text-white hover:bg-accent" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-5 border-t border-white/10 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <LockKeyhole size={20} className="mt-0.5 shrink-0 text-accent-bright" />
            <div>
              <p className="text-sm font-bold text-white">Güvenli alışveriş</p>
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed">Siparişlerinizi sitemizden ya da WhatsApp üzerinden verebilir, ödemeyi havale / EFT ile yapabilirsiniz. Kartla ödeme altyapısı hazırlanıyor, yakında hizmetinizde.</p>
            </div>
          </div>
          <ul className="flex shrink-0 items-center gap-3" aria-label="Kabul edilen kartlar">
            {cards.map((c) => (
              <li key={c.name} className="grid h-11 w-[72px] place-items-center rounded-[4px] bg-white px-2">
                <Image src={c.src} alt={c.name} width={c.w} height={c.h} unoptimized className="h-6 w-auto object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs md:flex-row md:px-6">
          <p className="text-center md:text-left">© {new Date().getFullYear()} Kombi Klima GO · {company.title}. Tüm hakları saklıdır.</p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {footerLinks["Sözleşmeler"].map((i) => (
              <li key={i.label}><Link href={i.href} className="hover:text-white">{i.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-white">
        <span className="h-4 w-[3px] bg-accent-bright" />{title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.label}><Link href={i.href} className="transition-colors hover:text-white">{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
