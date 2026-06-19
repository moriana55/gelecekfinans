// Doğrulanmış çalışan Türkçe finans feed'leri + kategori bazlı Google News RSS.
// (Eski ölü feed'ler çıkarıldı: paraanaliz/cointurk/ekonomim/trthaber-eski-url → 404/DNS.)
// Google News RSS sorguları UA gerektirmez, her kategori için bol taze konu döndürür;
// böylece "altın" gibi az haberli kategorilerde bile "konu bulunamadı" olmaz.
export const RSS_FEEDS = [
  // Genel çalışan kaynaklar
  "https://www.bloomberght.com/rss",
  "https://www.dunya.com/rss/gundem.xml",
  "https://koinmedya.com/feed/",
  "https://www.btchaber.com/feed/",
  "https://www.aa.com.tr/tr/rss/default?cat=ekonomi",
  "https://www.haberturk.com/rss/ekonomi.xml",
  "https://www.ntv.com.tr/ekonomi.rss",
  "https://www.sozcu.com.tr/feeds-rss-category-ekonomi",
  // Kategori bazlı Google News RSS (TR) — garanti taze konu
  "https://news.google.com/rss/search?q=alt%C4%B1n+gram+alt%C4%B1n+ons+OR+%C3%A7eyrek+alt%C4%B1n&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=bitcoin+OR+ethereum+OR+kripto+para&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=borsa+istanbul+OR+bist+100+OR+hisse&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=dolar+OR+euro+OR+d%C3%B6viz+kuru&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=enflasyon+OR+faiz+OR+merkez+bankas%C4%B1+OR+ekonomi&hl=tr&gl=TR&ceid=TR:tr",
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
