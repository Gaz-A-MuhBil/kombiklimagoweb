import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { teklifGetir } from "@/lib/teklif";
import { dosyaAdi } from "@/lib/teklif-tip";
import { TeklifBaski } from "./TeklifBaski";

export const dynamic = "force-dynamic";

// Kaydedilen PDF'in dosya adı sayfa başlığından gelir
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = /^\d+$/.test(id) && (await getAdmin()) ? await teklifGetir(Number(id)).catch(() => null) : null;
  return { title: { absolute: t ? dosyaAdi(t) : "Teklif" }, robots: { index: false, follow: false } };
}

// Teklifin yatay A4 baskı / PDF görünümü (tarayıcının "PDF olarak kaydet" seçeneğiyle PDF'e dönüşür)
export default async function TeklifYazdir({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const t = await teklifGetir(Number(id));
  if (!t) notFound();
  return <TeklifBaski t={t} />;
}
