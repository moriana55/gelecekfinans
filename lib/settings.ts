import { prisma } from "./db";

export interface Settings {
  ga4Id?: string;
  adsenseId?: string;
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
