"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("@/components/RichEditor"), { ssr: false });

interface SeoResult { score: number; issues: string[]; passed: string[]; }

export default function EditArticle() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", meta: "", keyword: "", category: "", content: "", imageUrl: "", status: "" });
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then(r => r.json())
      .then(d => {
        const a = d.article;
        setForm({ title: a.title, meta: a.meta, keyword: a.keyword || "", category: a.category, content: a.content, imageUrl: a.imageUrl || "", status: a.status });
        setSeo(d.seo);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSeo(d.seo);
    setSaving(false);
  }

  if (loading) return <p style={{ color: "#555" }}>Yükleniyor...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Makale Düzenle</h1>

        <Field label="Başlık" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
        <Field label="Meta Açıklama" value={form.meta} onChange={v => setForm(f => ({ ...f, meta: v }))} />
        <Field label="Anahtar Kelime" value={form.keyword} onChange={v => setForm(f => ({ ...f, keyword: v }))} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>Kategori</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ width: "100%", padding: "8px", background: "#151515", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }}>
              {["kripto", "borsa", "döviz", "altın", "ekonomi"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>Durum</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: "100%", padding: "8px", background: "#151515", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }}>
              {["DRAFT", "PUBLISHED", "REJECTED", "ARCHIVED"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <Field label="Görsel URL" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />

        <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>İçerik</label>
        <EditorTabs content={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} />

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 24px", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button onClick={() => router.push("/admin/makaleler")}
            style={{ padding: "10px 24px", background: "transparent", color: "#888", border: "1px solid #333", borderRadius: 4, cursor: "pointer" }}>
            Geri
          </button>
        </div>
      </div>

      {/* SEO Panel */}
      <div style={{ background: "#151515", border: "1px solid #222", borderRadius: 8, padding: 20, height: "fit-content", position: "sticky", top: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>SEO Skoru</h2>
        {seo && (
          <>
            <div style={{ fontSize: 36, fontWeight: 800, color: seo.score >= 70 ? "#4ade80" : seo.score >= 50 ? "#fbbf24" : "#f87171", marginBottom: 16 }}>
              {seo.score}/100
            </div>
            {seo.issues.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: "#f87171", marginBottom: 6, fontWeight: 600 }}>SORUNLAR</p>
                {seo.issues.map((i, idx) => <p key={idx} style={{ fontSize: 12, color: "#f87171", marginBottom: 4 }}>• {i}</p>)}
              </div>
            )}
            {seo.passed.length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: "#4ade80", marginBottom: 6, fontWeight: 600 }}>GEÇEN</p>
                {seo.passed.map((p, idx) => <p key={idx} style={{ fontSize: 12, color: "#4ade80", marginBottom: 4 }}>✓ {p}</p>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 12px", background: "#151515", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }} />
    </label>
  );
}

function EditorTabs({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <button type="button" onClick={() => setMode("visual")}
          style={{ padding: "4px 10px", fontSize: 10, borderRadius: 3, border: "1px solid #333", background: mode === "visual" ? "#fff" : "transparent", color: mode === "visual" ? "#000" : "#888", cursor: "pointer" }}>
          Görsel Editör
        </button>
        <button type="button" onClick={() => setMode("html")}
          style={{ padding: "4px 10px", fontSize: 10, borderRadius: 3, border: "1px solid #333", background: mode === "html" ? "#fff" : "transparent", color: mode === "html" ? "#000" : "#888", cursor: "pointer" }}>
          HTML
        </button>
      </div>
      {mode === "visual" ? (
        <RichEditor content={content} onChange={onChange} />
      ) : (
        <textarea value={content} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", minHeight: 400, padding: 12, background: "#151515", border: "1px solid #333", borderRadius: 4, color: "#ddd", fontSize: 13, fontFamily: "monospace", resize: "vertical" }} />
      )}
    </div>
  );
}
