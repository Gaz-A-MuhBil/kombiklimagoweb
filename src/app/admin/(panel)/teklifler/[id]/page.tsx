import { notFound } from "next/navigation";
import { ayarlarGetir, musterilerDb, teklifGetir } from "@/lib/teklif";
import { isMarka, yeniTeklif } from "@/lib/teklif-tip";
import { adminSite } from "@/lib/site-db";
import { PageHead } from "../../_ui";
import { TeklifEditor } from "../TeklifEditor";

export const dynamic = "force-dynamic";

// /admin/teklifler/yeni → yeni teklif; /admin/teklifler/12 → kayıtlı teklifi düzenle
export default async function TeklifSayfasi({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kopya?: string }> }) {
  const { id } = await params;
  const { kopya } = await searchParams;
  const [musteriler, ayar] = await Promise.all([musterilerDb().catch(() => []), ayarlarGetir()]);
  let teklif;
  if (id === "yeni") {
    // marka, panelde seçili markayla başlar (kurumsal seçiliyse GAZ-A)
    const site = await adminSite();
    teklif = yeniTeklif(ayar, isMarka(site) ? site : "gazamuh");
  } else {
    if (!/^\d+$/.test(id)) notFound();
    teklif = await teklifGetir(Number(id));
    if (!teklif) notFound();
  }
  return (
    <>
      <PageHead
        title={teklif.no ? `Teklif ${teklif.no}` : "Yeni Teklif"}
        sub={teklif.no ? [teklif.musteri.firma, teklif.proje].filter(Boolean).join(" · ") : "Markayı seçin, müşteri bilgilerini ve kalemleri girin. Kaydettikten sonra Excel ve PDF çıktısı alabilirsiniz."}
        back={{ href: "/admin/teklifler", label: "Teklifler" }}
      />
      <TeklifEditor key={teklif.id ?? "yeni"} ilk={teklif} musteriler={musteriler} kopya={kopya} />
    </>
  );
}
