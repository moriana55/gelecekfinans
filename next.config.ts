import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack workspace-root'unu proje klasörüne sabitle — yoksa yukarı
  // ~/Desktop'a çıkıp macOS korumalı klasör hatası ("Operation not permitted")
  // veriyor (çok-lockfile yüzünden yanlış root çıkarımı).
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
