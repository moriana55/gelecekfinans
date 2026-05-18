"use client";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const buttons = [
    { label: "X", href: `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, bg: "#000" },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encoded}`, bg: "#25d366" },
    { label: "Telegram", href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`, bg: "#0088cc" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, bg: "#0a66c2" },
  ];

  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
      {buttons.map(b => (
        <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
          style={{
            padding: "6px 12px", borderRadius: 3, fontSize: 10, fontWeight: 600,
            fontFamily: "var(--mono)", letterSpacing: ".06em",
            background: b.bg, color: "#fff", display: "inline-block",
          }}>
          {b.label}
        </a>
      ))}
      <button onClick={copyLink}
        style={{
          padding: "6px 12px", borderRadius: 3, fontSize: 10, fontWeight: 600,
          fontFamily: "var(--mono)", letterSpacing: ".06em",
          background: "var(--ground2)", color: "var(--muted)", border: "1px solid var(--rule)", cursor: "pointer",
        }}>
        Link Kopyala
      </button>
    </div>
  );
}
