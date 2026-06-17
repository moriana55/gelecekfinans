"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("@/components/RichEditor"), { ssr: false });

export default function NewArticle() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", meta: "", keyword: "", category: "kripto", content: "", imageUrl: "", source: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error + (data.score ? ` (Benzerlik: ${Math.round(data.score * 100)}%)` : ""));
      setSaving(false);
      return;
    }
    router.push(`/admin/makaleler/${data.article.id}`);
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111" }}>Yeni Makale</h1>
      {error && <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, marginBottom: 16, color: "#dc2626", fontSize: 13 }}>{error}</div>}

      <form onSubmit={submit}>
        <Field label="Başlık" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <Field label="Meta Açıklama" value={form.meta} onChange={v => setForm(f => ({ ...f, meta: v }))} required />
        <Field label="Anahtar Kelime" value={form.keyword} onChange={v => setForm(f => ({ ...f, keyword: v }))} />
        <Field label="Kaynak" value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} />

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Kategori</span>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ width: "100%", padding: "8px", background: "#fff", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 13 }}>
            {["kripto", "borsa", "doviz", "altin", "ekonomi"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <Field label="Görsel URL" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>İçerik</span>
          <RichEditor content={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} />
        </label>

        <button type="submit" disabled={saving}
          style={{ padding: "12px 28px", background: "#c73030", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Kaydediliyor..." : "Oluştur"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 13 }} />
    </label>
  );
}
