import { ayarlarGetir } from "@/lib/teklif";
import { HAZIRLAYAN, MARKALAR, SIRKET } from "@/lib/teklif-tip";
import { ayarlarKaydet } from "../../../teklif-actions";
import { SubmitButton } from "../../_client";
import { Label, Notice, PageHead, card, field } from "../../_ui";

export const dynamic = "force-dynamic";

export default async function TeklifAyarlari({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const a = await ayarlarGetir();
  return (
    <>
      <PageHead
        title="Teklif Ayarları"
        sub="Yeni teklif oluşturulduğunda gelen sabit başlık, giriş metni ve notlar. Kayıtlı teklifler değişmez; her teklifin notları kendi sayfasında ayrıca düzenlenebilir."
        back={{ href: "/admin/teklifler", label: "Teklifler" }}
      />
      <Notice saved={saved} />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <form action={ayarlarKaydet} className={`${card} space-y-5`}>
          <Label text="Varsayılan teklif başlığı"><input name="konu" defaultValue={a.konu} className={field} /></Label>
          <Label text="Giriş metni" hint="Teklifin üst kısmında, müşteri bilgilerinin altında görünür.">
            <textarea name="giris" rows={4} defaultValue={a.giris} className={field} />
          </Label>
          <Label text="Notlar / açıklamalar" hint="Her satır bir madde olarak numaralandırılır (teklifin sonunda görünür).">
            <textarea name="notlar" rows={12} defaultValue={a.notlar.join("\n")} className={`${field} leading-relaxed`} />
          </Label>
          <SubmitButton>Kaydet</SubmitButton>
        </form>
        <aside className={`${card} space-y-4 self-start text-sm`}>
          <div>
            <p className="font-bold">Sabit bilgiler</p>
            <p className="mt-1 text-xs text-muted">Her teklifte otomatik yer alır.</p>
          </div>
          <dl className="space-y-2">
            <div><dt className="text-xs text-muted">Hazırlayan</dt><dd className="font-semibold">{HAZIRLAYAN.ad} · {HAZIRLAYAN.telefon}</dd></div>
            <div><dt className="text-xs text-muted">Şirket</dt><dd className="font-semibold">{SIRKET.unvan}</dd><dd className="text-xs text-muted">{SIRKET.vergi}</dd></div>
            <div><dt className="text-xs text-muted">Adres</dt><dd>{SIRKET.adres}</dd></div>
            <div><dt className="text-xs text-muted">Banka</dt><dd>{SIRKET.banka} · <span className="font-mono text-xs">{SIRKET.iban}</span></dd></div>
            {Object.values(MARKALAR).map((m) => (
              <div key={m.ad}><dt className="text-xs text-muted">{m.ad}</dt><dd>{m.eposta} · {m.web}</dd></div>
            ))}
          </dl>
        </aside>
      </div>
    </>
  );
}
