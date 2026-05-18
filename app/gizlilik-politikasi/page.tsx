import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "GelecekFinans gizlilik politikası ve kişisel verilerin korunması.",
};

export default function GizlilikPolitikasi() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 900, marginBottom: 24 }}>Gizlilik Politikası</h1>
      <div className="article-prose">
        <p><strong>Son güncelleme:</strong> 17 Mayıs 2026</p>

        <h2>Toplanan Veriler</h2>
        <p>
          Sitemizi ziyaret ettiğinizde tarayıcı türü, IP adresi, ziyaret edilen sayfalar ve ziyaret
          süresi gibi anonim kullanım verileri otomatik olarak toplanabilir. Bu veriler Google Analytics
          ve Vercel Analytics aracılığıyla işlenir.
        </p>

        <h2>Çerezler</h2>
        <p>
          Sitemiz, kullanıcı deneyimini iyileştirmek ve trafik analizi yapmak amacıyla çerez
          kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
        </p>

        <h2>Üçüncü Taraf Hizmetler</h2>
        <p>
          Reklam hizmetleri (Google AdSense) ve analitik araçları üçüncü taraf çerezleri
          kullanabilir. Bu hizmetlerin kendi gizlilik politikaları geçerlidir.
        </p>

        <h2>Veri Güvenliği</h2>
        <p>
          Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulanmaktadır.
          Ancak internet üzerinden hiçbir veri iletimi %100 güvenli değildir.
        </p>

        <h2>Haklarınız</h2>
        <p>
          6698 sayılı KVKK kapsamında kişisel verilerinize erişim, düzeltme ve silme haklarına
          sahipsiniz. Taleplerinizi iletisim@gelecekfinans.com adresine iletebilirsiniz.
        </p>
      </div>
    </div>
  );
}
