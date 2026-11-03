import { sortByPopularity } from "@/lib/popularity";
import { getProducts, getSalesCounts } from "@/lib/products";
import { getSeason, sortBySeason } from "@/lib/season";

export const dynamic = "force-dynamic";

// Web (arama) ve mobil uygulama ürün listesini buradan okur. Açıklama listeye girmez (ürün sayısı arttıkça
// yanıt megabaytlara çıkıyordu); ürün detayında /api/app/product/[slug] açıklamayı ayrıca verir.
// Sıra: kategoriler mevsime göre, kategori içinde piyasada çok satanlar önde (uygulamadaki "Önerilen" bu sırayı korur).
export async function GET() {
  const [all, sales, season] = await Promise.all([getProducts(), getSalesCounts(), getSeason()]);
  const list = sortBySeason(sortByPopularity(all, sales), season, (p) => p.category).map((p) => ({ ...p, description: undefined }));
  return Response.json(list, { headers: { "Access-Control-Allow-Origin": "*" } });
}
