import Link from "next/link";
import type { Product } from "@/lib/data";
import { ProductCard } from "../ProductCard";

// Ana sayfada bir kategoriden en fazla 4 ürün; bölümlerin sırası mevsime göre değişir (lib/season)
export function CategoryRow({ eyebrow, title, href, linkLabel, products }: {
  eyebrow: string; title: string; href: string; linkLabel: string; products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 lg:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-primary md:text-4xl">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-2 rounded-[4px] border border-border bg-white px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">
          {linkLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
