import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { WA_KINDS } from "@/lib/whatsapp-log";
import { Empty, PageHead, SiteTag, card } from "../_ui";

type Item = { key: string; kind: string; label: string; site: unknown; source: string; message: string; page?: string | null; at: Date; sent?: boolean };

const LIMIT = 300;
const AUTO = "auto";

// Form talepleri (Bilgi Al, hizmet teklifi) WhatsApp'a otomatik gider. Bu yüzden geçmiş talepler de burada görünür;
// metin kayıtlı alanlardan yeniden oluşturulur (ürünün o günkü fiyatı ve bağlantısı saklanmadığı için yer almaz).
function leadText(r: RowDataPacket) {
  return [
    r.product_name ? (String(r.product_name).startsWith("Hizmet:") ? r.product_name : `Ürün: ${r.product_name}`) : "Genel bilgi talebi",
    `Ad Soyad: ${r.full_name}`,
    `Telefon: ${r.phone || "-"}`,
    r.email && `E-posta: ${r.email}`,
    r.city && `Şehir: ${r.city}`,
    r.message && `Mesaj: ${r.message}`,
  ].filter(Boolean).join("\n");
}

export default async function WhatsAppMessages({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const filter = f === AUTO || (f && f in WA_KINDS) ? f : undefined;
  let logs: RowDataPacket[] = [];
  let leads: RowDataPacket[] = [];
  // İki tablo da ilk kayıtta oluşur; yoksa o bölüm boş gelir
  if (filter !== AUTO) {
    try {
      [logs] = await db().query<RowDataPacket[]>(
        `SELECT * FROM whatsapp_logs ${filter ? "WHERE kind = ?" : ""} ORDER BY id DESC LIMIT ${LIMIT}`, filter ? [filter] : []);
    } catch {}
  }
  if (!filter || filter === AUTO) {
    try {
      [leads] = await db().query<RowDataPacket[]>(`SELECT * FROM leads ORDER BY id DESC LIMIT ${LIMIT}`);
    } catch {}
  }
  const items: Item[] = [
    ...logs.map((r): Item => ({
      key: `w${r.id}`, kind: r.kind, label: WA_KINDS[r.kind as keyof typeof WA_KINDS] ?? WA_KINDS.general,
      site: r.site, source: r.source === "app" ? "Mobil uygulama" : "Web sitesi", message: r.message, page: r.page, at: new Date(r.created_at),
    })),
    ...leads.map((r): Item => ({
      key: `l${r.id}`, kind: AUTO, label: "Form bildirimi", site: r.site, source: "Otomatik", message: leadText(r), at: new Date(r.created_at), sent: Boolean(r.wa_ok),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, LIMIT);

  const tabs: [string | undefined, string][] = [[undefined, "Tümü"], ...Object.entries(WA_KINDS) as [string, string][], [AUTO, "Form bildirimleri"]];

  return (
    <>
      <PageHead title="WhatsApp Mesajları" sub="Müşterilerin site ve uygulamadaki butonlarla WhatsApp'a hazırladığı mesajlar ile formlardan giden otomatik bildirimler. Buton kayıtları müşteri butona bastığında oluşur; mesajı WhatsApp'ta göndermekten vazgeçmiş olabilir." />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map(([key, label]) => (
          <Link key={label} href={key ? `/admin/whatsapp?f=${key}` : "/admin/whatsapp"}
            className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${filter === key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
            {label}
          </Link>
        ))}
      </div>
      {!items.length ? (
        <Empty text="Bu bölümde henüz mesaj yok." />
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.key} className={card}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold">{m.label}</span>
                <SiteTag site={m.site} />
                <span className="text-xs text-muted">{m.source}</span>
                <span className="text-xs text-muted">{m.at.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}</span>
                {m.sent !== undefined && (
                  m.sent ? <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">{"WhatsApp'a gitti"}</span>
                    : <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">{"WhatsApp'a gitmedi"}</span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line break-words rounded-xl bg-surface p-3 text-sm">{m.message}</p>
              {m.page && <p className="mt-2 text-xs text-muted">Sayfa: {m.page}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
