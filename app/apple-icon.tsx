import { ImageResponse } from "next/og";

// GelecekFinans apple touch icon — zümrüt (#047857) kart üzerinde yukarı
// yönlü finans/chart çizgisi. Küçük boyutlarda da net kalacak şekilde sade.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#047857",
          borderRadius: 40,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 22.5L13 15.5L18 19L26 9.5"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 9.5H26V14.5"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="13" cy="15.5" r="1.6" fill="#ffffff" />
          <circle cx="18" cy="19" r="1.6" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
