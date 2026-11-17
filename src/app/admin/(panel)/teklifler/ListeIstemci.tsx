"use client";
import { useState, useTransition } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { teklifDurumAyarla, teklifVeri } from "../../teklif-actions";
import { DURUMLAR, isDurum, type Durum } from "@/lib/teklif-tip";
import { iconBtn } from "../_ui";

// Listede durumu doğrudan değiştirme
export function DurumSec({ id, durum }: { id: number; durum: string }) {
  const [d, setD] = useState<Durum>(isDurum(durum) ? durum : "taslak");
  const [bekliyor, basla] = useTransition();
  return (
    <select
      value={d}
      disabled={bekliyor}
      onChange={(e) => {
        const yeni = e.target.value as Durum;
        setD(yeni);
        basla(() => teklifDurumAyarla(id, yeni));
      }}
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-7 text-xs font-bold disabled:opacity-60 ${DURUMLAR[d].renk}`}
      aria-label="Teklif durumu"
    >
      {(Object.keys(DURUMLAR) as Durum[]).map((k) => <option key={k} value={k}>{DURUMLAR[k].ad}</option>)}
    </select>
  );
}

// Listeden Excel indirme: teklif sunucudan alınır, dosya tarayıcıda üretilir
export function ExcelIndir({ id }: { id: number }) {
  const [bekliyor, setBekliyor] = useState(false);
  return (
    <button
      type="button"
      className={iconBtn}
      title="Excel indir"
      aria-label="Excel indir"
      disabled={bekliyor}
      onClick={async () => {
        setBekliyor(true);
        try {
          const t = await teklifVeri(id);
          if (!t) return alert("Teklif bulunamadı.");
          const { teklifExcel } = await import("@/lib/teklif-excel");
          await teklifExcel(t);
        } catch (e) {
          alert(`Excel oluşturulamadı: ${(e as Error).message}`);
        } finally {
          setBekliyor(false);
        }
      }}
    >
      {bekliyor ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-green-700" />}
    </button>
  );
}
