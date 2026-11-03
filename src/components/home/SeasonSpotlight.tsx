import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SeasonSpotlight as Spotlight } from "@/lib/season";
import { slugify } from "@/lib/slug";
import { Reveal } from "./Reveal";

// Sezonun öne çıkan kategorisi: neden şimdi, kapasite rehberi (arama sonuçlarına gider) ve kısa öneriler.
// İçerik lib/season.ts'teki SPOTLIGHT'tan gelir; sezon admin panelinden (Mevsim Sıralaması) elle de seçilebilir.
export function SeasonSpotlight({ s, count }: { s: Spotlight; count: number }) {
  const href = `/${slugify(s.category)}`;
  return (
    <section aria-labelledby="sezon-baslik" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">{s.eyebrow} · {s.category}</p>
          <h2 id="sezon-baslik" className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-primary md:text-[44px]">
            {s.title} <span className="text-accent">{s.highlight}</span>
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-foreground/75">{s.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href} className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {count} modeli incele <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/bilgi-al" className="inline-flex items-center gap-2 rounded-[4px] bg-accent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Ücretsiz keşif iste
            </Link>
          </div>

          <ol className="mt-12 grid gap-4">
            {s.tips.map((t, n) => (
              <li key={t.title} className="flex gap-4 rounded-[4px] border border-border bg-white p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-accent/10 text-sm font-extrabold tabular-nums text-accent">{n + 1}</span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-primary">{t.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-foreground/75">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[4px] bg-primary p-7 text-white md:p-10">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <p className="eyebrow eyebrow-light">Kapasite rehberi</p>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">{s.sizeTitle}</h3>
            <ul className="mt-7 border-t border-white/15">
              {s.sizes.map((z) => (
                <li key={z.value} className="border-b border-white/15">
                  <Link href={`/urunler?q=${encodeURIComponent(`${s.category} ${z.q}`)}`}
                    className="group flex items-center gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <span className="min-w-0 flex-1 text-sm font-medium text-white/75">{z.area}</span>
                    <span className="text-2xl font-extrabold tabular-nums tracking-tight md:text-3xl">{z.value}</span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] bg-white/10 transition-colors group-hover:bg-accent">
                      <ArrowUpRight size={18} aria-hidden />
                    </span>
                    <span className="sr-only">{s.category} modellerini göster</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-white/70">{s.sizeNote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
