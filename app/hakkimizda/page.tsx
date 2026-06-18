import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "GelecekFinans hakkında bilgi edinin. Misyonumuz, ekibimiz ve editoryal politikamız.",
  alternates: { canonical: "https://gelecekfinans.com/hakkimizda" },
  openGraph: {
    type: "website",
    url: "https://gelecekfinans.com/hakkimizda",
    title: "Hakkımızda — GelecekFinans",
    description: "GelecekFinans hakkında bilgi edinin. Misyonumuz ve editoryal politikamız.",
    siteName: "GelecekFinans",
  },
  twitter: { card: "summary", title: "Hakkımızda — GelecekFinans" },
};

export default function Hakkimizda() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 100px" }}>
      <h1 style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 900, marginBottom: 24, color: "#111" }}>Hakkımızda</h1>
      <div className="article-prose">
        <p>
          <strong>GelecekFinans</strong>, Türkiye&apos;nin güncel finans ve ekonomi haberlerini hızlı, tarafsız ve
          anlaşılır bir dille aktaran bağımsız bir haber platformudur.
        </p>
        <h2>Misyonumuz</h2>
        <p>
          Borsa, döviz, kripto para, altın ve makroekonomi alanlarında yatırımcıları doğru bilgiyle
          buluşturmak. Karmaşık finansal gelişmeleri herkesin anlayabileceği bir dile çevirmek.
        </p>
        <h2>Editoryal Politikamız</h2>
        <p>
          Tüm içeriklerimiz bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.
          Kaynaklarımızı açıkça belirtir, doğrulanmamış bilgileri yayınlamayız.
          Sponsorlu içerikler açıkça etiketlenir.
        </p>
        <h2>İletişim</h2>
        <p>
          Sorularınız, önerileriniz veya düzeltme talepleriniz için{" "}
          <a href="mailto:iletisim@gelecekfinans.com" style={{ color: "var(--accent)" }}>iletisim@gelecekfinans.com</a> adresinden bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
}
