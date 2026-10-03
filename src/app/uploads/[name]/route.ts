import { contentType, readImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Ürün ve içerik görselleri veritabanında "/uploads/<ad>" olarak durur; iki site de aynı veritabanını kullanır.
// Görsel bu sunucunun UPLOAD_DIR klasöründe yoksa UPLOAD_FALLBACK_URL'deki siteye (gazamuhendislik.com.tr) yönlendirilir.
const FALLBACK = (process.env.UPLOAD_FALLBACK_URL || "").replace(/\/$/, "");

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const data = await readImage(name);
  if (!data) {
    if (FALLBACK && /^[a-f0-9]{24}\.(jpg|png|webp)$/.test(name)) return Response.redirect(`${FALLBACK}/uploads/${name}`, 302);
    return new Response("Bulunamadı", { status: 404 });
  }
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType(name),
      // dosya adı rastgele olduğundan içeriği değişmez
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
