import { notFound } from "next/navigation";
import { getKurumsal } from "@/lib/kurumsal";
import { bolumBul } from "@/lib/kurumsal-bolumler";
import { SITES } from "@/lib/sites";
import { PageHead } from "../../_ui";
import { KurumsalEditor } from "../Editor";

export const dynamic = "force-dynamic";

// GAZ-A Kurumsal sitesinin bir bölümü (firma bilgileri, slider, hizmetler, blog...)
export default async function KurumsalBolumPage({ params }: { params: Promise<{ bolum: string }> }) {
  const bolum = bolumBul((await params).bolum);
  if (!bolum) notFound();
  const { deger, guncelleme } = await getKurumsal(bolum.anahtar);
  const site = SITES.gazakurumsal.url;
  return (
    <>
      <PageHead title={bolum.ad} sub={bolum.aciklama} />
      <p className="-mt-4 mb-6 text-xs text-muted">
        GAZ-A Kurumsal sitesi{site && <> (<a href={site} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{site.replace(/^https?:\/\//, "")}</a>)</>}
        {" · "}{guncelleme ? `Son kayıt: ${new Date(guncelleme).toLocaleString("tr-TR")}` : "Henüz kaydedilmedi; sitedeki varsayılan içerik gösteriliyor."}
      </p>
      <KurumsalEditor key={bolum.anahtar} bolum={bolum} ilk={deger} />
    </>
  );
}
