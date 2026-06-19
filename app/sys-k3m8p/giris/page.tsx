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
      router.push("/sys-k3m8p");
    }
  }

  return (
    <div className="adm-login-wrap">
      <form onSubmit={handleSubmit} className="adm-login-card">
        <div className="adm-login-mk">GF</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 4, letterSpacing: "-.01em" }}>
          Yönetim Girişi
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>Gelecek Finans yönetim paneli</p>
        {error && <p style={{ color: "var(--dn)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <label style={{ display: "block", marginBottom: 16 }}>
          <span className="adm-label">E-posta</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="adm-input" />
        </label>
        <label style={{ display: "block", marginBottom: 24 }}>
          <span className="adm-label">Şifre</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="adm-input" />
        </label>
        <button type="submit" disabled={loading} className="adm-btn adm-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
