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

export const ARTICLE_WORDS = 1000;
export const ARTICLE_MIN_WORDS = 600;

export const CATEGORY_PROMPTS: Record<string, { system_extra: string; structure: string }> = {
  kripto: {
    system_extra: "Kripto para piyasalarında teknik analiz, blockchain teknolojisi ve DeFi konularında uzmansın. Fiyat seviyeleri, piyasa değeri ve hacim verisi kullan. Türk kripto yatırımcısının perspektifinden yaz.",
    structure: "Piyasa Durumu → Teknik Görünüm → Temel Sürücüler → Türk Yatırımcıya Etki → Öngörü",
  },
  borsa: {
    system_extra: "BIST ve küresel borsalarda hisse senedi analizi, bilanço okuma ve sektör karşılaştırmasında uzmansın. BIST endeks seviyeleri, yabancı yatırımcı hareketleri ve sektörel rotasyonu analiz et.",
    structure: "Borsa Görünümü → Teknik Analiz → Sektörel Değerlendirme → Kurumsal Yatırımcı Hareketi → Strateji",
  },
  doviz: {
    system_extra: "Forex piyasaları, merkez bankası politikaları ve TL kur dinamiklerinde uzmansın. TCMB kararları, cari açık, rezerv ve faiz farkını birlikte değerlendir.",
    structure: "Kur Tablosu → Teknik Seviyeler → TCMB Politikası → Küresel Dolar Endeksi → TL Beklentisi",
  },
  altin: {
    system_extra: "Kıymetli madenler piyasasında gram altın, ons altın ve TL bazlı fiyatlama konusunda uzmansın. Fed faiz beklentisi, jeopolitik risk ve enflasyonu birlikte değerlendir.",
    structure: "Altın Fiyatı → Küresel Sürücüler → Fed & Enflasyon Bağlantısı → Gram Altın TL Analizi → Yatırım Perspektifi",
  },
  ekonomi: {
    system_extra: "Türkiye ve küresel makroekonomide enflasyon, faiz, büyüme ve işsizlik verilerini yorumlamada uzmansın. TÜİK ve TCMB verilerini, IMF ve Dünya Bankası projeksiyonlarıyla karşılaştır.",
    structure: "Mevcut Ekonomik Tablo → Veri Analizi → Politika Değerlendirmesi → Küresel Karşılaştırma → Öngörü",
  },
};
