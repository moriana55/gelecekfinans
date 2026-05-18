"use client";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border2)",
        padding: "40px 32px",
        borderRadius: "var(--radius)",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, color: "var(--accent)" }}>Teşekkürler!</p>
        <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--muted)", marginTop: 8 }}>Günlük bültenimize kaydoldunuz.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border2)",
      padding: "40px 32px",
      borderRadius: "var(--radius)",
    }}>
      <p style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
        Günlük Finans Bülteni
      </p>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
        Her sabah piyasa özeti ve öne çıkan haberler e-postanızda.
      </p>
      <form onSubmit={subscribe} style={{ display: "flex", gap: 8 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz" required
          style={{
            flex: 1, padding: "10px 16px",
            background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: "var(--radius)", color: "var(--ink)", fontSize: 14,
            fontFamily: "var(--sans)", outline: "none",
          }}
        />
        <button type="submit" disabled={status === "loading"}
          style={{
            padding: "10px 24px", background: "var(--accent)", color: "var(--bg)",
            border: "none", borderRadius: "var(--radius)",
            fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "var(--sans)",
          }}>
          {status === "loading" ? "..." : "Abone Ol"}
        </button>
      </form>
      {status === "error" && <p style={{ color: "var(--dn)", fontSize: 13, marginTop: 8 }}>Bir hata oluştu, tekrar deneyin.</p>}
    </div>
  );
}
