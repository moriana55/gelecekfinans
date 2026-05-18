import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 900, color: "var(--rule)" }}>404</h1>
      <p style={{ fontFamily: "var(--sans)", fontSize: 18, color: "var(--muted)", marginTop: 12 }}>
        Aradığınız sayfa bulunamadı.
      </p>
      <Link
        href="/"
        style={{ display: "inline-block", marginTop: 24, fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", letterSpacing: ".08em" }}
      >
        ← Ana Sayfaya Dön
      </Link>
    </div>
  );
}
