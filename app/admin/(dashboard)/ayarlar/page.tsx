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
    <div style={{ maxWidth: 640 }}>
      <h1 className="adm-h1" style={{ marginBottom: 22 }}>Site Ayarları</h1>

      <Section title="Google Analytics">
        <Field label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" value={settings.ga4Id}
          onChange={v => setSettings(s => ({ ...s, ga4Id: v }))} />
      </Section>

      <Section title="Google AdSense">
        <Field label="AdSense Publisher ID" placeholder="ca-pub-XXXXXXXX" value={settings.adsenseId}
          onChange={v => setSettings(s => ({ ...s, adsenseId: v }))} />
        <p className="adm-label" style={{ margin: "12px 0 8px" }}>Reklam Pozisyonları</p>
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

      <button onClick={save} disabled={saving} className="adm-btn adm-btn-primary" style={{ marginTop: 2, padding: "12px 28px" }}>
        {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="adm-card">
      <div className="adm-card-h"><div><b>{title}</b></div></div>
      <div className="adm-card-b">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span className="adm-label">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="adm-input" />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "4px 0" }}>
      <span className="adm-sw">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="track" />
      </span>
      <span style={{ fontSize: 13, color: "var(--ink2)" }}>{label}</span>
    </label>
  );
}
