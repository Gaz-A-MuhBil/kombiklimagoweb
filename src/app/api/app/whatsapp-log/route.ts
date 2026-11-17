import { createHash } from "node:crypto";
import { body, fail, json, preflight } from "@/lib/app-api";
import { clientIp, tooMany } from "@/lib/ratelimit";
import { saveWhatsAppLog } from "@/lib/whatsapp-log";

export const OPTIONS = preflight;

// Site ve uygulamadaki WhatsApp butonlarının hazır mesajı. Herkese açık uç olduğu için hız sınırlıdır; IP adresi saklanmaz.
export async function POST(req: Request) {
  const ip = await clientIp();
  if (tooMany(`wa-log:${ip}`, 30, 10 * 60_000)) return fail("Çok fazla istek.", 429);
  const b = await body(req);
  const text = b.str("text", 4000);
  if (text.length < 3) return fail("Mesaj boş.");
  // Aynı butona art arda basmak tek kayıt sayılır
  const same = createHash("sha1").update(text).digest("hex");
  if (tooMany(`wa-log-same:${ip}:${same}`, 1, 30_000)) return json({ ok: true });
  try {
    await saveWhatsAppLog(text, b.str("source", 10) === "app" ? "app" : "web", b.str("page", 255));
    return json({ ok: true });
  } catch (e) {
    console.error("[whatsapp log]", (e as Error).message);
    return fail("Kaydedilemedi.", 500);
  }
}
