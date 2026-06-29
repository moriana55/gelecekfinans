import type { Prisma } from "@prisma/client";

/**
 * Domain tipindeki bir nesneyi Prisma'nın JSON kolonu giriş tipine güvenle
 * dönüştürür. `ArticleExtras` gibi `interface` tipleri (index-signature
 * içermedikleri için) doğrudan `InputJsonValue`'ya atanamaz; bu sınır
 * yardımcısı dönüşümü tek yerde, açıkça yapar.
 */
export function asJson(value: object): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}
