import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tile } from "@/lib/cms";
import { Reveal } from "./Reveal";

// Dikey görselli kartlar; başlık görselin alt kısmında görünür.
export function Showcase({ tiles }: { tiles: Tile[] }) {
  if (!tiles.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-14 md:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t, n) => (
          <Reveal key={t.id} delay={(n % 4) * 0.08}>
            <Link href={t.url} className="group relative block aspect-[4/5] overflow-hidden rounded-[4px] bg-gradient-to-br from-[#071a2e] via-primary to-accent">
              {t.image && <Image src={t.image} alt={t.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071a2e]/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4 text-white sm:p-6">
                <p className="text-base font-extrabold drop-shadow sm:text-xl">{t.title}</p>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-accent transition-transform group-hover:translate-x-1"><ArrowRight size={18} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
