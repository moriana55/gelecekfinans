import { ImageResponse } from "next/og";

export const alt = "GelecekFinans — Finans & Ekonomi Haberleri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>
          <span style={{ color: "#fff" }}>gelecek</span>
          <span style={{ color: "#c73030" }}>finans</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#888",
            marginTop: 16,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Finans & Ekonomi Haberleri
        </div>
      </div>
    ),
    { ...size }
  );
}
