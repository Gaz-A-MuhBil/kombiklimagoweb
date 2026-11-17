import { db } from "./db";
import { SITE_KEY } from "./sites";

// Site ve uygulamadaki WhatsApp butonlarının hazırladığı mesajlar. wa.me bağlantısı müşterinin kendi WhatsApp'ını açtığı için
// mesajın gerçekten gönderilip gönderilmediği bilinemez; buradaki kayıt "butona basıldı" anlamına gelir.
export const WA_KINDS = {
  order: "Sepet siparişi",
  payment: "Ödeme bildirimi",
  price: "Fiyat sorma",
  survey: "Keşif talebi",
  general: "Genel mesaj",
} as const;
export type WaKind = keyof typeof WA_KINDS;

// Tür, istemcinin söylediğine değil hazır mesajın metnine göre belirlenir
export function waKind(text: string): WaKind {
  if (/sipariş vermek istiyorum/i.test(text)) return "order";
  if (/numaralı sipariş/i.test(text)) return "payment";
  if (/fiyat bilgisi/i.test(text)) return "price";
  if (/keşif/i.test(text)) return "survey";
  return "general";
}

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await db().query(`CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    site VARCHAR(20) NOT NULL,
    source VARCHAR(10) NOT NULL,
    kind VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    page VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kind (kind),
    INDEX idx_created (created_at)
  ) CHARACTER SET utf8mb4`);
  tableReady = true;
}

export async function saveWhatsAppLog(text: string, source: "web" | "app", page: string) {
  await ensureTable();
  await db().query("INSERT INTO whatsapp_logs (site, source, kind, message, page) VALUES (?,?,?,?,?)", [SITE_KEY, source, waKind(text), text, page || null]);
}
