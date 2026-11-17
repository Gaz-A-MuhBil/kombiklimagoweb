import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

const words = ["Doğalgaz projesi", "İGDAŞ yetkili bayi", "Kombi ve klima montajı", "Periyodik bakım", "Yapı sistemleri", "Ücretsiz keşif"];

// Mağaza ile kurumsal bölüm arasındaki geçiş: kayan hizmet şeridi, büyük tanıtım cümlesi ve rakamlar.
// Bundan sonraki bölümler (hizmetler, İGDAŞ, teklif) firmayı anlatır; üstü alışveriş.
export function ZoneIntro({ products, brands, categories }: { products: number; brands: number; categories: number }) {
  const stats = [
    { n: <>2020</>, unit: "", label: "Kuruluş yılı; İstanbul geneli hizmet" },
    { n: <CountUp to={products} />, unit: "ürün", label: "Faturalı ve garantili ürün çeşidi" },
    { n: <CountUp to={brands} />, unit: "marka", label: "Yetkili satış ve montaj" },
    { n: <CountUp to={categories} />, unit: "grup", label: "Isıtma, soğutma ve sıcak su" },
  ];
  return (
    <section id="kurumsal" className="relative isolate overflow-hidden bg-primary-deep text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_85%_0%,rgba(217,86,27,0.20),transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(180deg,#000,transparent_75%)]" />

      <div className="flex overflow-hidden border-b border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="marquee flex shrink-0 items-center" style={{ animationDuration: "60s" }}>
            {[...words, ...words].map((w, i) => (
              <li key={i} className="flex items-center whitespace-nowrap text-lg font-light text-white/75 md:text-xl">
                {w}<span aria-hidden className="mx-8 h-1.5 w-1.5 rotate-45 bg-accent" />
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-24 md:px-10 lg:pt-32">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ffa36e]">Kurumsal · Kombi Klima GO</p>
          <h2 className="mt-7 max-w-5xl text-3xl font-light leading-[1.18] tracking-tight md:text-5xl md:leading-[1.12]">
            Ürünü satmakla bitmiyor.{" "}
            <span className="text-white/45">Keşiften kapasite hesabına, montajdan periyodik bakıma kadar</span>{" "}
            işin mühendisliğini de biz üstleniyoruz.
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/bilgi-al" className="inline-flex items-center gap-2 rounded-[4px] bg-accent px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-accent-bright">
              Teklif alın <ArrowRight size={15} />
            </Link>
            <Link href="/hakkimizda" className="inline-flex items-center rounded-[4px] border border-white/25 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition hover:border-white hover:bg-white hover:text-primary">
              Hakkımızda
            </Link>
          </div>
        </Reveal>

        <dl className="mt-20 grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
          {stats.map((s, n) => (
            <Reveal key={s.label} delay={n * 0.08} className={`py-9 lg:py-12 ${n % 2 ? "border-l border-white/10 pl-6 md:pl-8" : "pr-6"} ${n > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${n === 2 ? "lg:border-l lg:pl-8" : ""}`}>
              <dd className="flex items-baseline gap-2 text-4xl font-semibold tabular-nums tracking-tight md:text-5xl">
                {s.n}{s.unit && <span className="text-lg font-medium text-[#ffa36e] md:text-xl">{s.unit}</span>}
              </dd>
              <dt className="mt-3 max-w-[16rem] text-sm leading-snug text-white/60">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
