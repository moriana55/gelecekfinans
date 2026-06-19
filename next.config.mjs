// Tüm yanıtlara uygulanan temel güvenlik header'ları.
const securityHeaders = [
  // Tıklama hırsızlığına (clickjacking) karşı: sayfa hiçbir iframe içine gömülemez.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // MIME türü tahminini kapat.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dış sitelere referer sızıntısını sınırla.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Gereksiz tarayıcı API'lerini kapat.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sunucu kimliğini ifşa eden header'ı kaldır.
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      // Tüm yollar için temel güvenlik header'ları.
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Gizli yönetim paneli arama motorlarına HİÇ düşmesin (robots.txt'te yazılı değil).
      {
        source: "/sys-k3m8p/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
