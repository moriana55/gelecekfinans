/**
 * Basit, bağımlılıksız in-memory rate limiter (sliding window).
 * Serverless tek-instance / düşük trafik için yeterli; dağıtık ortamda
 * Redis tabanlı bir çözümle değiştirilebilir. Fail-open değil — limit
 * aşılırsa istek reddedilir.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) || []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    const retryAfterSec = Math.ceil((hits[0] + windowMs - now) / 1000);
    buckets.set(key, hits);
    return { ok: false, remaining: 0, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Bellek sızıntısını önlemek için ara sıra eski anahtarları temizle.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      const fresh = v.filter((t) => t > cutoff);
      if (fresh.length === 0) buckets.delete(k);
      else buckets.set(k, fresh);
    }
  }

  return { ok: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

/** İstekten en iyi tahmini istemci IP'sini çıkarır. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
