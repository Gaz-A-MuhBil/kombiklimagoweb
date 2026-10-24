import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Web (arama) ve mobil uygulama ürün listesini buradan okur. Açıklama listeye girmez (ürün sayısı arttıkça
// yanıt megabaytlara çıkıyordu); ürün detayında /api/app/product/[slug] açıklamayı ayrıca verir.
export async function GET() {
  const list = (await getProducts()).map((p) => ({ ...p, description: undefined }));
  return Response.json(list, { headers: { "Access-Control-Allow-Origin": "*" } });
}
