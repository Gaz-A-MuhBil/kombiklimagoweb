import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import VARSAYILAN from "../../data/kurumsal-varsayilan.json";

// GAZ-A Kurumsal sitesinin içeriği: anahtar → JSON (bölümler lib/kurumsal-bolumler.ts).
// Kaydı olmayan bölüm, kurumsal sitedeki varsayılan içerikle (data/kurumsal-varsayilan.json) açılır.
let ready = false;
export async function ensureKurumsalTable() {
  if (ready) return;
  await db().query(`CREATE TABLE IF NOT EXISTS kurumsal_icerik (
    anahtar VARCHAR(40) PRIMARY KEY,
    deger MEDIUMTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
  ready = true;
}

export async function getKurumsal(anahtar: string): Promise<{ deger: unknown; guncelleme: Date | null }> {
  const varsayilan = (VARSAYILAN as Record<string, unknown>)[anahtar] ?? null;
  try {
    await ensureKurumsalTable();
    const [rows] = await db().query<RowDataPacket[]>("SELECT deger, updated_at FROM kurumsal_icerik WHERE anahtar = ?", [anahtar]);
    if (!rows.length) return { deger: varsayilan, guncelleme: null };
    const v = JSON.parse(rows[0].deger);
    // nesne bölümlerinde sonradan eklenen alanlar varsayılandan tamamlanır
    const deger = v && !Array.isArray(v) && typeof v === "object" && varsayilan && typeof varsayilan === "object" ? { ...varsayilan, ...v } : v;
    return { deger, guncelleme: rows[0].updated_at };
  } catch {
    return { deger: varsayilan, guncelleme: null };
  }
}

export async function setKurumsal(anahtar: string, deger: unknown) {
  await ensureKurumsalTable();
  await db().query("INSERT INTO kurumsal_icerik (anahtar, deger) VALUES (?, ?) ON DUPLICATE KEY UPDATE deger = VALUES(deger)", [anahtar, JSON.stringify(deger)]);
}
