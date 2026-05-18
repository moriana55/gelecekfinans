"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Geçersiz e-posta veya şifre");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <form onSubmit={handleSubmit} style={{ background: "#151515", padding: 40, borderRadius: 8, width: 360, border: "1px solid #222" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 }}>
          Admin Giriş
        </h1>
        {error && <p style={{ color: "#e55", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>E-posta</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 14 }} />
        </label>
        <label style={{ display: "block", marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Şifre</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 14 }} />
        </label>
        <button type="submit" disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
