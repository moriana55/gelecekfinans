import { prisma } from "./db";

export interface Settings {
  ga4Id?: string;
  adsenseId?: string;
  // Google Search Console doğrulama meta etiketi (google-site-verification içeriği).
  // Admin panelden girilir; layout metadata'sı buradan okur.
  searchConsoleVerification?: string;
  adSlots?: {
    headerBanner?: boolean;
    inArticle?: boolean;
    sidebar?: boolean;
    afterArticle?: boolean;
  };
  breakingNewsEnabled?: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  ga4Id: "",
  adsenseId: "",
  // Mevcut (commit f204b4f ile eklenen) doğrulama kodu default olarak korunur;
  // admin panelden değiştirilince DB'deki değer bunu ezer.
  searchConsoleVerification: "4aVBJpoKMchlL_iSElublDYdFr8BMugU2qMg3zU32D8",
  adSlots: { headerBanner: false, inArticle: false, sidebar: false, afterArticle: false },
  breakingNewsEnabled: true,
};

export async function getSettings(): Promise<Settings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(row.value as object) };
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged = { ...current, ...data };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { value: merged as object },
    create: { id: "singleton", value: merged as object },
  });
  return merged;
}
