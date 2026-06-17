export const RSS_FEEDS = [
  "https://www.bloomberght.com/rss",
  "https://www.dunya.com/rss/gundem.xml",
  "https://www.paraanaliz.com/feed/",
  "https://koinmedya.com/feed/",
  "https://www.btchaber.com/feed/",
  "https://cointurk.com/feed/",
  "https://www.ekonomim.com/rss.xml",
  "https://www.trthaber.com/xml/rss/ekonomi.xml",
];

export const CATEGORIES: Record<string, string[]> = {
  kripto: ["bitcoin", "ethereum", "kripto", "btc", "eth", "altcoin", "blockchain"],
  borsa: ["bist", "hisse", "endeks", "borsa", "pay", "temettü"],
  doviz: ["dolar", "euro", "kur", "forex", "sterlin", "yen"],
  altin: ["altın", "gram altın", "ons", "çeyrek"],
  ekonomi: ["faiz", "enflasyon", "merkez bankası", "tcmb", "büyüme", "fed"],
};

export const ARTICLE_WORDS = 600;
export const ARTICLE_MIN_WORDS = 400;

export const CATEGORY_PROMPTS: Record<string, { system_extra: string; structure: string }> = {
  kripto: {
    system_extra: "Kripto para piyasalarında blockchain teknolojisi, DeFi ve regülasyon konularında uzmansın. Güncel piyasa değeri ve hacim verisi kullan. Türk yatırımcının perspektifinden yaz. Fiyat tahmini veya hedef verme.",
    structure: "Piyasa Durumu → Güncel Gelişmeler → Temel Sürücüler → Türkiye'deki Etkiler → Değerlendirme",
  },
  borsa: {
    system_extra: "BIST ve küresel borsalarda sektör analizi, bilanço okuma ve makro değerlendirmede uzmansın. Endeks seviyelerini ve yabancı yatırımcı hareketlerini aktar ama al-sat tavsiyesi verme.",
    structure: "Borsa Görünümü → Sektörel Değerlendirme → Yabancı Yatırımcı Hareketi → Makro Etkenler → Genel Değerlendirme",
  },
  doviz: {
    system_extra: "Merkez bankası politikaları ve TL kur dinamiklerinde uzmansın. TCMB kararları, cari açık, rezerv ve faiz farkını birlikte değerlendir. Kur tahmini veya hedef seviye verme.",
    structure: "Güncel Kur Tablosu → TCMB Politikası → Küresel Gelişmeler → TL Üzerindeki Etkiler → Değerlendirme",
  },
  altin: {
    system_extra: "Kıymetli madenler piyasasında gram altın, ons altın ve TL bazlı fiyatlama konusunda uzmansın. Fed faiz beklentisi, jeopolitik risk ve enflasyonu birlikte değerlendir. Fiyat hedefi verme.",
    structure: "Güncel Altın Fiyatı → Küresel Sürücüler → Fed & Enflasyon Bağlantısı → Gram Altın TL Değerlendirmesi → Genel Bakış",
  },
  ekonomi: {
    system_extra: "Türkiye ve küresel makroekonomide enflasyon, faiz, büyüme ve işsizlik verilerini yorumlamada uzmansın. TÜİK ve TCMB verilerini, IMF ve Dünya Bankası projeksiyonlarıyla karşılaştır.",
    structure: "Mevcut Ekonomik Tablo → Veri Analizi → Politika Değerlendirmesi → Küresel Karşılaştırma → Değerlendirme",
  },
};
