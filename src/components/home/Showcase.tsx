import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tile } from "@/lib/cms";
import { Reveal } from "./Reveal";

// Kategori kartları. Beş ve daha fazla kart varsa ilki (sıra mevsime göre: kışın Kombi, yazın Klima) büyük durur:
// masaüstünde 2×2 alan kaplar, diğerleri yanına ve altına dizilir; mobilde en üstte tam genişlikte.
export function Showcase({ tiles }: { tiles: Tile[] }) {
  if (!tiles.length) return null;
  const feature = tiles.length >= 5;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-14 md:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((t, n) => {
          const big = feature && n === 0;
          return (
            <Reveal key={t.id} delay={(n % 4) * 0.08} className={big ? "col-span-2 lg:row-span-2" : undefined}>
              <Link href={t.url}
                className={`group relative block h-full overflow-hidden rounded-[4px] bg-gradient-to-br from-[#071a2e] via-primary to-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${big ? "aspect-square lg:aspect-auto" : "aspect-square sm:aspect-[4/5]"}`}>
                {t.image && <Image src={t.image} alt={t.title} fill sizes={big ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071a2e]/85 to-transparent" />
                <div className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 text-white ${big ? "p-5 sm:p-8" : "p-3 sm:p-5"}`}>
                  <p className={`min-w-0 font-extrabold drop-shadow ${big ? "text-2xl sm:text-4xl" : "text-sm sm:text-lg"}`}>{t.title}</p>
                  <span className={`grid shrink-0 place-items-center rounded-[4px] bg-accent transition-transform group-hover:translate-x-1 ${big ? "h-11 w-11" : "h-8 w-8 sm:h-9 sm:w-9"}`}><ArrowRight size={big ? 20 : 16} aria-hidden /></span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
