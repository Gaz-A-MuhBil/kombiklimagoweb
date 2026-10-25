"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PackageCheck, Percent, SlidersHorizontal, Star, X } from "lucide-react";
import { consentSnapshot, parseConsent, subscribeConsent } from "@/lib/consent";
import { appLinks, appPopup } from "@/lib/site";

// Ziyaretçiye ekranın ortasında (telefonda alttan) açılan "Uygulamamızı indirin" penceresi.
// Ayarlar lib/site.ts → appPopup; mağaza bağlantıları appLinks'ten gelir.
const SNOOZE_KEY = "app-popup-dismissed"; // localStorage: kapatıldığı an (ms)
const SESSION_KEY = "app-popup-shown"; // sessionStorage: bu oturumda gösterildi
const SSR = "__ssr__";

const perks = [
  { icon: Percent, text: "Uygulamaya özel kampanyalar ve indirimler" },
  { icon: PackageCheck, text: "Birkaç dokunuşla kolay sipariş ve takip" },
  { icon: SlidersHorizontal, text: "Marka, kapasite ve özelliğe göre filtreleme", fresh: true },
];

type Store = "ios" | "android";

// Depolama erişimi gizli sekmede/engelli çerezlerde hata verebilir; sessizce yok sayılır
function read(storage: "local" | "session", key: string) {
  try { return (storage === "local" ? localStorage : sessionStorage).getItem(key); } catch { return null; }
}
function write(storage: "local" | "session", key: string, value: string) {
  try { (storage === "local" ? localStorage : sessionStorage).setItem(key, value); } catch { /* yok say */ }
}

function detectStore(): Store | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
}

export function AppPopup() {
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribeConsent, consentSnapshot, () => SSR);
  const consented = raw !== SSR && !!parseConsent(raw);
  const hiddenHere = appPopup.hidden.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<Store | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Bekleme süresi dolunca ya da biraz kaydırınca bir kez aç (çerez bildirimi yanıtlandıktan sonra)
  useEffect(() => {
    if (!appPopup.enabled || hiddenHere || !consented || open) return;
    if (read("session", SESSION_KEY)) return;
    const last = Number(read("local", SNOOZE_KEY));
    if (last && Date.now() - last < appPopup.snoozeDays * 864e5) return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      write("session", SESSION_KEY, "1");
      returnFocus.current = document.activeElement as HTMLElement | null;
      setDevice(detectStore());
      setOpen(true);
    };
    const timer = window.setTimeout(show, appPopup.delayMs);
    // Çerez kararı yeni verildiyse kaydırma ile hemen açılmasın diye kısa bir ara
    const armedAt = Date.now() + 1500;
    const onScroll = () => { if (window.scrollY > appPopup.scrollPx && Date.now() > armedAt) show(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { done = true; window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [consented, hiddenHere, open]);

  const close = useCallback(() => {
    write("local", SNOOZE_KEY, String(Date.now()));
    setOpen(false);
  }, []);

  // Esc ile kapatma, odak pencere içinde döner, arka plan kaymaz; kapanınca odak eski yerine döner
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      returnFocus.current?.focus?.();
    };
  }, [open, close]);

  // Telefondan gelen ziyaretçiye kendi mağazası önce ve vurgulu gösterilir; ikisi de görünür
  const live: Record<Store, boolean> = { ios: appLinks.iosLive, android: true };
  const order: Store[] = device === "android" ? ["android", "ios"] : ["ios", "android"];
  const featured = device && live[device] ? device : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div data-lenis-prevent onClick={close}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-6">
          <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="app-popup-title" aria-describedby="app-popup-text"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 60, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid max-h-[94dvh] w-full max-w-[820px] overflow-hidden overflow-y-auto rounded-t-[12px] bg-white shadow-2xl shadow-black/30 sm:rounded-[6px] md:grid-cols-[0.95fr_1.05fr]">
            <button ref={closeRef} onClick={close} aria-label="Kapat"
              className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-foreground shadow-md ring-1 ring-black/5 transition hover:bg-white hover:text-primary">
              <X size={20} />
            </button>

            {/* Görsel taraf: marka renginde zemin ve iki telefon ekranı */}
            <div className="relative h-[210px] overflow-hidden text-white sm:h-[250px] md:h-auto md:min-h-[480px]"
              style={{ background: "linear-gradient(140deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 62%, black) 100%)" }}>
              <div aria-hidden className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/[0.06]" />
              <div aria-hidden className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-accent/25 blur-2xl" />
              <div aria-hidden className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur md:left-6 md:top-6">
                <Star size={12} className="fill-accent text-accent" /> Ücretsiz · iOS ve Android
              </div>
              <motion.div initial={{ y: 40, opacity: 0, rotate: -9 }} animate={{ y: 0, opacity: 1, rotate: -7 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-[14%] top-[62px] w-[32%] max-w-[150px] sm:top-[70px] md:left-[9%] md:top-[110px] md:w-[44%] md:max-w-none">
                <Phone {...appPopup.screens[1]} />
              </motion.div>
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-[14%] top-[40px] w-[36%] max-w-[170px] sm:top-[46px] md:right-[8%] md:top-[70px] md:w-[50%] md:max-w-none">
                <Phone {...appPopup.screens[0]} priority />
              </motion.div>
            </div>

            {/* İçerik */}
            <div className="relative px-5 pb-6 pt-6 sm:px-8 md:py-10 md:pl-9 md:pr-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Mobil uygulama</p>
              <h2 id="app-popup-title" className="mt-2 pr-8 text-2xl font-light leading-tight tracking-tight text-foreground md:text-[30px]">
                {appPopup.name} <span className="font-bold text-primary">artık cebinizde</span>
              </h2>
              <p id="app-popup-text" className="mt-3 text-sm leading-relaxed text-muted">
                Uygulamamızı indirin; kampanyaları ilk siz görün, aradığınız ürünü saniyeler içinde bulup kolayca sipariş verin.
              </p>
              <ul className="mt-5 space-y-2.5">
                {perks.map(({ icon: Icon, text, fresh }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Icon size={16} /></span>
                    <span className="min-w-0">
                      {fresh && <span className="mr-1.5 rounded-[3px] bg-accent px-1.5 py-0.5 align-[1px] text-[10px] font-bold uppercase tracking-wider text-white">Yeni</span>}
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {order.map((s) => (
                  <StoreBadge key={s} store={s} live={live[s]} featured={featured === s} wide={!!featured} onPick={close} />
                ))}
              </div>
              <button onClick={close} className="mt-4 w-full text-center text-xs font-semibold text-muted underline-offset-4 transition-colors hover:text-primary hover:underline">
                Şimdi değil
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Phone({ src, alt, width, height, priority }: { src: string; alt: string; width: number; height: number; priority?: boolean }) {
  return (
    <div className="rounded-[24px] border-[5px] border-[#0d1117] bg-[#0d1117] shadow-2xl shadow-black/40">
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes="200px" className="h-auto w-full rounded-[19px]" />
    </div>
  );
}

// Resmi mağaza rozetlerine benzeyen siyah butonlar; yayında olmayan mağaza "Yakında" olarak pasif
function StoreBadge({ store, live, featured, wide, onPick }: { store: Store; live: boolean; featured: boolean; wide: boolean; onPick: () => void }) {
  const ios = store === "ios";
  const top = !live ? "Çok yakında" : ios ? "App Store'dan" : "GOOGLE PLAY'DEN";
  const bottom = ios ? (live ? "İndirin" : "App Store") : "ALIN";
  const base = `inline-flex h-[52px] min-w-0 items-center gap-2.5 rounded-[10px] px-3 transition ${wide ? "col-span-2 justify-center" : ""} ${featured ? "ring-2 ring-accent ring-offset-2" : ""}`;
  const inner = (
    <>
      {ios ? <AppleIcon /> : <PlayIcon />}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[10px] font-medium tracking-wide opacity-85">{top}</span>
        <span className="mt-1 truncate text-[17px] font-semibold tracking-tight">{bottom}</span>
      </span>
    </>
  );
  if (!live) {
    return <span aria-disabled="true" title="iOS uygulaması yakında App Store'da" className={`${base} cursor-not-allowed border border-border bg-surface text-muted`}>{inner}</span>;
  }
  return (
    <a href={ios ? appLinks.ios : appLinks.android} target="_blank" rel="noopener noreferrer" onClick={onPick}
      aria-label={ios ? "App Store'dan indirin" : "Google Play'den alın"}
      className={`${base} ${wide && !featured ? "border border-border bg-white text-foreground hover:border-foreground/40" : "bg-black text-white hover:-translate-y-0.5 hover:bg-black/85"}`}>
      {inner}
    </a>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden className="shrink-0">
      <path fill="#2196F3" d="M3.6 1.8 13.5 12l-9.9 10.2c-.36-.2-.6-.6-.6-1.1V2.9c0-.5.24-.9.6-1.1z" />
      <path fill="#00D26A" d="M3.6 1.8c.37-.21.83-.21 1.22.01L16.9 8.7 13.5 12z" />
      <path fill="#FF3D57" d="M13.5 12l3.4 3.3-12.08 6.89c-.39.22-.85.22-1.22.01z" />
      <path fill="#FFC400" d="M16.9 8.7l3.62 2.07c.9.52.9 1.93 0 2.45L16.9 15.3 13.5 12z" />
    </svg>
  );
}
