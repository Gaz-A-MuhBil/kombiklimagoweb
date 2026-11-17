"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BadgeCheck, Heart, Mail, MapPin, Menu, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import type { MenuItem } from "@/lib/menu";
import { contact, igdas } from "@/lib/site";
import { cartCount, useCart } from "@/store/cart";
import { SearchOverlay } from "./SearchOverlay";
import { SocialIcons } from "./SocialIcons";
import { useSite } from "./SiteProvider";

const tel = `tel:+9${contact.phone.replace(/\s/g, "")}`;

// Kategori açılır menüsü: yalnızca üzerine gelinen başlığın altında küçük bir kutu (markalar + tümünü gör)
function CategoryPanel({ m, onPick }: { m: MenuItem; onPick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
      className="absolute left-0 top-full z-10 w-[420px] rounded-b-[4px] border border-t-0 border-border bg-white p-5 shadow-[0_18px_40px_-18px_rgba(7,26,46,0.5)]">
      <p className="mb-2 px-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">{m.label} markaları</p>
      <ul className="grid grid-cols-2 gap-x-3">
        {m.brands.map((b) => (
          <li key={b.name}>
            <Link href={`${m.href}?marka=${encodeURIComponent(b.name)}`} onClick={onPick}
              className="flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-1.5 text-sm font-semibold hover:bg-surface hover:text-primary">
              <span className="truncate">{b.name}</span><span className="text-xs font-medium tabular-nums text-muted">{b.count}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border px-2.5 pt-4">
        <Link href={m.href} onClick={onPick} className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          Tüm {m.label} ({m.count})<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/bilgi-al" onClick={onPick} className="rounded-[4px] bg-accent px-3.5 py-2 text-sm font-bold text-white hover:bg-accent-bright">Teklif al</Link>
      </div>
    </motion.div>
  );
}

// Kurumsal üç katlı header: iletişim şeridi (kaydırınca gider), beyaz ana bar ve lacivert kategori menüsü.
// Ana bar ile menü yapışkandır (sticky); yükseklikleri sabit olduğundan sayfa kaymaz.
export function Header({ menu, popular }: { menu: MenuItem[]; popular: string[] }) {
  const count = useCart((s) => cartCount(s.items));
  const { user, favs, enabled } = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const closeSearch = useCallback(() => setSearch(false), []);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Fare menünün üstünden geçerken açılmasın: başlık üzerinde kısa süre durunca açılır
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hover = (label: string | null) => {
    if (timer.current) clearTimeout(timer.current);
    if (!label) return setOpen(null);
    timer.current = setTimeout(() => setOpen(label), open ? 60 : 160);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const close = () => { setOpen(null); setMobile(false); };

  const iconLink = "relative flex flex-col items-center gap-0.5 rounded-[4px] px-2 py-1.5 text-foreground/80 transition-colors hover:text-primary sm:px-3";
  const iconLabel = "hidden text-[11px] font-semibold lg:block";
  const badge = "absolute -top-0.5 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold text-white sm:right-1.5";

  return (
    <>
      {/* İletişim şeridi */}
      <div className="hidden bg-primary-deep text-[13px] text-white/75 md:block">
        <div className="mx-auto flex h-10 w-full max-w-7xl items-center gap-6 px-4 md:px-6">
          <a href={tel} className="flex items-center gap-2 transition-colors hover:text-white"><Phone size={14} className="text-accent-bright" />{contact.phone}</a>
          <a href={`mailto:${contact.email}`} className="hidden items-center gap-2 transition-colors hover:text-white lg:flex"><Mail size={14} className="text-accent-bright" />{contact.email}</a>
          <span className="hidden items-center gap-2 xl:flex"><MapPin size={14} className="text-accent-bright" />Ümraniye / İstanbul</span>
          <span className="ml-auto flex items-center gap-2"><BadgeCheck size={15} className="text-accent-bright" />{igdas.title} · Yetki No {igdas.no}</span>
          <span className="h-4 w-px bg-white/20" />
          <SocialIcons className="flex gap-0.5" itemClass="h-7 w-7 text-white/70 hover:text-white" size={14} />
        </div>
      </div>

      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_10px_30px_-18px_rgba(7,26,46,0.55)]" : ""}`}
        onMouseLeave={() => hover(null)}>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4 md:h-[76px] md:gap-6 md:px-6">
          <button className="-ml-1 p-1.5 lg:hidden" aria-label="Menü" aria-expanded={mobile} onClick={() => setMobile((v) => !v)}>
            {mobile ? <X size={26} /> : <Menu size={26} />}
          </button>
          <Link href="/" className="shrink-0" onClick={close}>
            <Image src="/brand/logo.png" alt="Kombi Klima GO" width={1200} height={242} className="h-8 w-auto sm:h-10 md:h-12" priority />
          </Link>

          <button onClick={() => setSearch(true)}
            className="ml-2 hidden h-11 flex-1 items-center gap-3 rounded-[4px] border border-border bg-surface pl-4 pr-1 text-left text-sm text-muted transition-colors hover:border-primary/40 md:flex lg:ml-6 lg:max-w-xl">
            <Search size={17} className="shrink-0" />
            <span className="flex-1 truncate">Ürün, kategori veya marka ara…</span>
            <span className="rounded-[3px] bg-primary px-4 py-2 text-xs font-bold text-white">Ara</span>
          </button>

          <div className="ml-auto flex items-center">
            <button onClick={() => setSearch(true)} className={`${iconLink} md:hidden`} aria-label="Ara"><Search size={22} /></button>
            <Link href={user ? "/hesabim" : "/giris"} className={iconLink} aria-label={user ? "Hesabım" : "Giriş yap"}>
              <User size={22} />
              <span className={`${iconLabel} max-w-20 truncate`}>{user ? user.name : "Giriş Yap"}</span>
            </Link>
            <Link href={enabled ? "/favoriler" : "/giris"} className={`${iconLink} hidden sm:flex`} aria-label="Favorilerim">
              <Heart size={22} />
              <span className={iconLabel}>Favoriler</span>
              {favs.size > 0 && <span className={`${badge} bg-primary`}>{favs.size}</span>}
            </Link>
            <Link href="/sepet" className={iconLink} aria-label="Sepetim">
              <ShoppingCart size={22} />
              <span className={iconLabel}>Sepetim</span>
              {count > 0 && <span className={`${badge} bg-accent`}>{count}</span>}
            </Link>
            <Link href="/bilgi-al" onClick={close}
              className="ml-3 hidden h-11 items-center gap-2 rounded-[4px] bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-bright xl:inline-flex">
              Ücretsiz Keşif & Teklif
            </Link>
          </div>
        </div>

        <nav className="hidden bg-primary lg:block" aria-label="Kategoriler">
          <ul className="mx-auto flex h-12 w-full max-w-7xl items-stretch px-4 md:px-6">
            <li onMouseEnter={() => hover(null)}>
              <Link href="/urunler" onClick={close}
                className={`flex h-full items-center gap-2 whitespace-nowrap bg-primary-deep px-4 text-sm font-bold text-white xl:px-5 ${pathname === "/urunler" ? "text-accent-bright" : ""}`}>
                <Menu size={16} />Tüm Ürünler
              </Link>
            </li>
            {menu.map((m) => {
              const on = pathname === m.href || open === m.label;
              return (
                <li key={m.href} className="relative" onMouseEnter={() => hover(m.label)}>
                  <Link href={m.href} onClick={close} aria-current={pathname === m.href ? "page" : undefined}
                    className={`relative flex h-full items-center whitespace-nowrap px-2.5 text-[13px] font-semibold transition-colors xl:px-3 xl:text-[13.5px] ${on ? "bg-white/10 text-white" : "text-white/85 hover:text-white"}`}>
                    {m.label}
                    {pathname === m.href && <span className="absolute inset-x-3 bottom-0 h-[3px] bg-accent-bright" />}
                  </Link>
                  <AnimatePresence>{open === m.label && <CategoryPanel m={m} onPick={close} />}</AnimatePresence>
                </li>
              );
            })}
            <li className="ml-auto hidden xl:block" onMouseEnter={() => hover(null)}>
              <Link href="/hakkimizda" onClick={close} className="flex h-full items-center whitespace-nowrap px-3 text-[13.5px] font-semibold text-white/85 hover:text-white">Kurumsal</Link>
            </li>
            <li className="hidden xl:block" onMouseEnter={() => hover(null)}>
              <Link href="/blog" onClick={close} className="flex h-full items-center whitespace-nowrap px-3 text-[13.5px] font-semibold text-white/85 hover:text-white">Blog</Link>
            </li>
            <li className="ml-auto xl:ml-0" onMouseEnter={() => hover(null)}>
              <Link href="/iletisim" onClick={close} className="flex h-full items-center whitespace-nowrap pl-3 text-[13.5px] font-semibold text-white/85 hover:text-white">İletişim</Link>
            </li>
          </ul>
        </nav>

        <AnimatePresence>
          {mobile && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-white lg:hidden" data-lenis-prevent>
              <ul className="py-2">
                <li><Link href="/urunler" onClick={close} className="block px-5 py-3 font-bold text-primary">Tüm Ürünler</Link></li>
                {menu.map((m) => (
                  <li key={m.href}>
                    <Link href={m.href} onClick={close} className="flex items-center justify-between px-5 py-3 font-semibold">
                      {m.label}<span className="text-xs font-normal text-muted">{m.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="border-t border-border py-2 text-[15px]">
                <li><Link href="/hakkimizda" onClick={close} className="block px-5 py-2.5 font-semibold">Kurumsal</Link></li>
                <li><Link href="/blog" onClick={close} className="block px-5 py-2.5 font-semibold">Blog</Link></li>
                <li><Link href="/iletisim" onClick={close} className="block px-5 py-2.5 font-semibold">İletişim</Link></li>
                <li><Link href="/favoriler" onClick={close} className="block px-5 py-2.5 font-semibold">Favorilerim</Link></li>
              </ul>
              <div className="space-y-3 border-t border-border p-5">
                <Link href="/bilgi-al" onClick={close} className="flex h-12 items-center justify-center rounded-[4px] bg-accent font-bold text-white">Ücretsiz Keşif & Teklif</Link>
                <a href={tel} className="flex h-12 items-center justify-center gap-2 rounded-[4px] border border-primary font-bold text-primary"><Phone size={18} />{contact.phone}</a>
              </div>
              <SocialIcons className="flex gap-2 border-t border-border px-5 py-4" itemClass="h-10 w-10 bg-surface text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>{search && <SearchOverlay popular={popular} onClose={closeSearch} />}</AnimatePresence>
    </>
  );
}
