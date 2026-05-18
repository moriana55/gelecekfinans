"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 900, color: "var(--ink)" }}>Bir hata oluştu</h1>
      <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: "var(--muted)", marginTop: 12 }}>
        Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 24, fontFamily: "var(--mono)", fontSize: 12, padding: "8px 20px",
          background: "var(--ink)", color: "var(--ground)", border: "none", borderRadius: 4, cursor: "pointer",
        }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
