"use client";
import { useEffect, useState, useCallback } from "react";

interface Sub {
  id: string;
  email: string;
  active: boolean;
  confirmed?: boolean;
  preferences?: string[];
  source?: string | null;
  createdAt: string;
}

const SEGMENTS = ["kripto", "borsa", "doviz", "altin", "ekonomi"];

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchSubs = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/subscribers?filter=${filter}`)
      .then(r => r.json())
      .then(d => { setSubs(d.subscribers || []); setTotal(d.total); setActiveCount(d.activeCount); setConfirmedCount(d.confirmedCount || 0); })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function toggleSub(id: string, active: boolean) {
    await fetch(`/api/admin/subscribers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    fetchSubs();
  }

  async function deleteSub(id: string) {
    if (!confirm("Bu aboneyi silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/subscribers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchSubs();
  }

  async function exportCsv() {
    const csv = ["email,active,confirmed,preferences,source,createdAt", ...subs.map(s => `${s.email},${s.active},${s.confirmed ?? ""},${(s.preferences || []).join("|")},${s.source ?? ""},${s.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aboneler.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>
          Aboneler <span style={{ color: "#999", fontSize: 14, fontWeight: 400 }}>({activeCount} aktif / {confirmedCount} onaylı / {total} toplam)</span>
        </h1>
        <button onClick={exportCsv} style={{ padding: "8px 16px", background: "#e5e5e5", color: "#333", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
          CSV İndir
        </button>
      </div>

      <CampaignSender />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "active", "inactive"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, border: "1px solid #ddd", background: filter === f ? "#111" : "transparent", color: filter === f ? "#fff" : "#888", cursor: "pointer" }}>
            {f === "all" ? "Tümü" : f === "active" ? "Aktif" : "Pasif"}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: "#999" }}>Yükleniyor...</p> : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5", color: "#999" }}>
              <th style={{ textAlign: "left", padding: "10px 0" }}>E-posta</th>
              <th style={{ textAlign: "left" }}>Tercihler</th>
              <th style={{ textAlign: "left" }}>Durum</th>
              <th style={{ textAlign: "left" }}>Kayıt Tarihi</th>
              <th style={{ textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 0", color: "#222" }}>{s.email}</td>
                <td style={{ color: "#666", fontSize: 11 }}>
                  {s.preferences && s.preferences.length > 0 ? s.preferences.join(", ") : "Tümü"}
                </td>
                <td>
                  <span style={{ fontSize: 11, color: s.active ? "#16a34a" : "#999" }}>
                    {s.active ? "Aktif" : "Pasif"}
                  </span>
                  {s.confirmed === false && (
                    <span style={{ fontSize: 9, color: "#d97706", marginLeft: 6 }}>(onaysız)</span>
                  )}
                </td>
                <td style={{ color: "#888", fontSize: 12 }}>{new Date(s.createdAt).toLocaleDateString("tr-TR")}</td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => toggleSub(s.id, s.active)}
                    style={{ fontSize: 10, color: s.active ? "#d97706" : "#16a34a", background: "none", border: "none", cursor: "pointer", marginRight: 8 }}>
                    {s.active ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <button onClick={() => deleteSub(s.id)}
                    style={{ fontSize: 10, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && subs.length === 0 && <p style={{ color: "#999", fontSize: 13, marginTop: 12 }}>Abone bulunamadı.</p>}
    </div>
  );
}

function CampaignSender() {
  const [segment, setSegment] = useState("");
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    if (!subjectA.trim()) { setResult("Konu satırı (A) zorunlu."); return; }
    if (!confirm("Bültüni şimdi göndermek istediğine emin misin?")) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment: segment || undefined, subjectA, subjectB: subjectB || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setResult(d.error || "Gönderim başarısız."); }
      else if (d.sent === 0 || (d.sentA === 0 && d.sentB === 0)) {
        setResult(`Gönderilmedi (${d.reason || (d.mailEnabled === false ? "RESEND_API_KEY yok — log/no-op" : "bilinmeyen")}). Alıcı: ${d.recipients ?? 0}`);
      } else {
        setResult(`Gönderildi → A: ${d.recipientsA} alıcı, B: ${d.recipientsB} alıcı (kampanya ${d.campaignId}).`);
      }
    } catch {
      setResult("Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>Segment + A/B Bülten Gönder</h2>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: 10, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Segment</label>
          <select value={segment} onChange={e => setSegment(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6, fontSize: 13, background: "#fff", color: "#111" }}>
            <option value="">Tüm aboneler</option>
            {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Konu A</label>
          <input value={subjectA} onChange={e => setSubjectA(e.target.value)} maxLength={150}
            placeholder="Günlük bülten — konu satırı"
            style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#111" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4 }}>Konu B (A/B testi — opsiyonel)</label>
          <input value={subjectB} onChange={e => setSubjectB(e.target.value)} maxLength={150}
            placeholder="Alternatif konu satırı"
            style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6, fontSize: 13, color: "#111" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <button onClick={send} disabled={sending}
          style={{ padding: "8px 18px", background: "#c73030", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {sending ? "Gönderiliyor..." : "Gönder"}
        </button>
        {result && <span style={{ fontSize: 12, color: "#555" }}>{result}</span>}
      </div>
      <p style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
        Yalnızca onaylı + aktif aboneler hedeflenir. Son 24 saatte yayımlanan
        {segment ? ` ${segment}` : ""} makaleleri kullanılır. RESEND_API_KEY yoksa gönderim no-op (loglanır).
      </p>
    </div>
  );
}
