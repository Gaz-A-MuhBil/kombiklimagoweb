import type { Product } from "./data";

/*
  "Önerilen" sıralama: piyasada en çok satılanlar önde. Elimizde piyasa satış verisi olmadığı için sıra şu kurallarla kurulur:
  her markanın ürünleri kendi içinde 1) fiyatı olan ve stoktaki 2) sitede çok satılan 3) en çok satılan kapasitedeki
  (kombide 24 kW, klimada 12.000 BTU) 4) indirimi yüksek olana göre dizilir; sonra markalar Türkiye pazarındaki tercih sırasıyla
  (aşağıdaki liste) sırayla birer ürün verir: her markanın en iyisi, sonra her markanın ikincisi… Böylece liste tek markaya kaymaz.
  Marka sıraları bizim tahminimizdir; değiştirmek için listede markanın yerini değiştirmek yeterli.
*/
const BRANDS: Record<string, string[]> = {
  Kombi: ["Demirdöküm", "Vaillant", "Baymak", "ECA", "Bosch", "Buderus", "Viessmann", "Protherm", "Daikin", "Airfel", "Termoteknik", "Ariston", "Daxom", "Warmhaus", "Maktek", "Hosseven", "Termodinamik"],
  Klima: ["Daikin", "Arçelik", "Bosch", "Baymak", "LG", "Vaillant", "Viessmann", "Demirdöküm", "Airfel", "ECA", "York"],
  Radyatör: ["Demirdöküm", "ECA", "Baymak", "Termoteknik", "Bosch", "Vaillant", "Protherm", "Buderus", "Euroterm", "Radyal", "Notarad", "Risa"],
  "Isı Pompası": ["Daikin", "Vaillant", "Viessmann", "Bosch", "Baymak", "Demirdöküm", "Arçelik", "ECA"],
  "Oda Termostatı": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Bosch", "Buderus", "Protherm", "Viessmann", "Mars Electric"],
  Şofben: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Daxom"],
  Termosifon: ["Baymak", "Demirdöküm", "Ariston", "Arçelik", "Protherm"],
  Kazan: ["Buderus", "Bosch"],
};
const GENERAL = ["Demirdöküm", "Vaillant", "Daikin", "Baymak", "ECA", "Bosch", "Buderus", "Arçelik", "Viessmann", "Protherm", "Airfel"];

export function brandRank(category: string, brand: string) {
  const list = BRANDS[category] ?? GENERAL;
  const i = list.indexOf(brand);
  if (i >= 0) return i;
  const g = GENERAL.indexOf(brand);
  return list.length + (g >= 0 ? g : GENERAL.length);
}

// En çok satılan kapasiteler önde: kombi 24 → 20/28 → 30+, klima 12.000 → 9.000 → 18.000 → 24.000 BTU
function capacityRank(p: Product) {
  if (p.category === "Kombi") {
    // "24 kW", "24/30 kW" ya da model adındaki "P24", "2424"
    const kw = Number((/(\d{2})\s*(?:\/\s*\d{2}\s*)?kw/i.exec(p.name) ?? /(?:^|\D)(\d{2})(?:\/?\d{2})?(?:\s|$|-)/.exec(p.name))?.[1]);
    return ({ 24: 0, 20: 1, 28: 1, 30: 2, 25: 2, 35: 3 } as Record<number, number>)[kw] ?? 4;
  }
  if (p.category === "Klima") {
    const btu = Number(/(\d{1,2})[.]?000\s*btu/i.exec(p.name)?.[1]);
    return ({ 12: 0, 9: 1, 18: 2, 24: 3 } as Record<number, number>)[btu] ?? 4;
  }
  return 0;
}

const discount = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0);

export function sortByPopularity(products: Product[], sales: Map<string, number> = new Map()) {
  const key = new Map(products.map((p) => [p, {
    buyable: p.price > 0 && p.inStock ? 0 : 1, sold: sales.get(p.id) ?? 0, cap: capacityRank(p), off: discount(p),
  }]));
  const inBrand = (a: Product, b: Product) => {
    const x = key.get(a)!, y = key.get(b)!;
    return x.buyable - y.buyable || y.sold - x.sold || x.cap - y.cap || y.off - x.off || a.name.localeCompare(b.name, "tr");
  };
  // Markalar pazar sırasıyla turlar halinde birer ürün verir
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const k = `${p.category}|${p.brand}`;
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const lists = [...groups.values()].map((l) => l.sort(inBrand))
    .sort((a, b) => brandRank(a[0].category, a[0].brand) - brandRank(b[0].category, b[0].brand));
  const out: Product[] = [];
  for (let round = 0; out.length < products.length; round++) for (const l of lists) if (l[round]) out.push(l[round]);
  // fiyatsız / stokta olmayanlar en sona (kararlı sıralama, tur düzeni korunur)
  return out.sort((a, b) => key.get(a)!.buyable - key.get(b)!.buyable);
}

// Liste başındaki marka butonları için: pazar sırasına göre tüm markalar
export function brandsByPopularity(category: string | null, brands: string[]) {
  return [...new Set(brands)].sort((a, b) => brandRank(category ?? "", a) - brandRank(category ?? "", b) || a.localeCompare(b, "tr"));
}
