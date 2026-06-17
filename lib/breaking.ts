/**
 * Son dakika (breaking news) yardımcıları.
 * Otomatik süre dolumu: bir haber `expiresAt` zamanı geçince ya da
 * `expiresAt` yoksa `createdAt + DEFAULT_HOURS` süresi dolunca pasif sayılır.
 *
 * DEFAULT_HOURS env ile ayarlanabilir: BREAKING_NEWS_TTL_HOURS (varsayılan 6).
 */

export const DEFAULT_BREAKING_TTL_HOURS = (() => {
  const raw = parseInt(process.env.BREAKING_NEWS_TTL_HOURS || "6", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 6;
})();

export interface BreakingRecord {
  id?: string;
  text?: string;
  url?: string | null;
  active: boolean;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
}

/** Bir haberin şu an geçerli (aktif + süresi dolmamış) olup olmadığını döner. */
export function isBreakingLive(item: BreakingRecord, now: Date = new Date()): boolean {
  if (!item || !item.active) return false;
  const expiry = effectiveExpiry(item);
  return now < expiry;
}

/** Etkin son kullanma zamanı: expiresAt varsa onu, yoksa createdAt + TTL kullanır. */
export function effectiveExpiry(item: BreakingRecord): Date {
  if (item.expiresAt) return new Date(item.expiresAt);
  const created = new Date(item.createdAt);
  return new Date(created.getTime() + DEFAULT_BREAKING_TTL_HOURS * 60 * 60 * 1000);
}

/** POST gövdesinden gelen ttlHours değerinden expiresAt hesaplar. */
export function computeExpiry(ttlHours?: number | null, from: Date = new Date()): Date {
  const h = Number.isFinite(ttlHours) && (ttlHours as number) > 0
    ? (ttlHours as number)
    : DEFAULT_BREAKING_TTL_HOURS;
  return new Date(from.getTime() + h * 60 * 60 * 1000);
}
