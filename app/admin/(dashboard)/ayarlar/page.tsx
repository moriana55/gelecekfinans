"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    ga4Id: "", adsenseId: "",
    adSlots: { headerBanner: false, inArticle: false, sidebar: false, afterArticle: false },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(setSettings);
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111" }}>Site Ayarları</h1>

      <Section title="Google Analytics">
        <Field label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" value={settings.ga4Id}
          onChange={v => setSettings(s => ({ ...s, ga4Id: v }))} />
      </Section>

      <Section title="Google AdSense">
        <Field label="AdSense Publisher ID" placeholder="ca-pub-XXXXXXXX" value={settings.adsenseId}
          onChange={v => setSettings(s => ({ ...s, adsenseId: v }))} />
        <p style={{ fontSize: 11, color: "#999", margin: "12px 0 8px" }}>Reklam Pozisyonları</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Toggle label="Header Banner" checked={settings.adSlots.headerBanner}
            onChange={v => setSettings(s => ({ ...s, adSlots: { ...s.adSlots, headerBanner: v } }))} />
          <Toggle label="Makale İçi" checked={settings.adSlots.inArticle}
            onChange={v => setSettings(s => ({ ...s, adSlots: { ...s.adSlots, inArticle: v } }))} />
          <Toggle label="Sidebar" checked={settings.adSlots.sidebar}
            onChange={v => setSettings(s => ({ ...s, adSlots: { ...s.adSlots, sidebar: v } }))} />
          <Toggle label="Makale Altı" checked={settings.adSlots.afterArticle}
            onChange={v => setSettings(s => ({ ...s, adSlots: { ...s.adSlots, afterArticle: v } }))} />
        </div>
      </Section>

      <button onClick={save} disabled={saving}
        style={{ marginTop: 24, padding: "12px 28px", background: "#c73030", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
        {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, padding: 20, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#333" }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "8px 12px", background: "#fafafa", border: "1px solid #ddd", borderRadius: 6, color: "#111", fontSize: 13 }} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)}
        style={{ width: 36, height: 20, borderRadius: 10, background: checked ? "#16a34a" : "#ddd", position: "relative", transition: "background .2s" }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }} />
      </div>
      <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
    </label>
  );
}
