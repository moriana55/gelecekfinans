-- Owner aksiyonu: Article tablosuna AI "Özet & Etki + SSS" alanını ekler.
-- Bu proje `prisma db push` kullanır; tercih edilen yol:
--     npm run db:push        (npx prisma db push)
-- Bu SQL yalnızca referans/manuel uygulama içindir (db push yerine geçmez).
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "aiExtras" JSONB;
