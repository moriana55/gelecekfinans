"use client";
import { useState } from "react";

/**
 * Mevduat (vadeli hesap) faiz hesaplayıcı. Brüt + stopaj sonrası net getiri.
 * Saf client, bağımlılıksız.
 */
export default function DepositCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [annualRate, setAnnualRate] = useState("45"); // yıllık brüt %
  const [days, setDays] = useState("32");
  const [tax, setTax] = useState("10"); // stopaj %

  const P = parseFloat(principal.replace(",", "."));
  const ar = parseFloat(annualRate.replace(",", ".")) / 100;
  const d = parseInt(days);
  const t = parseFloat(tax.replace(",", ".")) / 100;
  const valid =
    !isNaN(P) && P > 0 && isFinite(P) &&
    !isNaN(ar) && ar >= 0 && isFinite(ar) &&
    !isNaN(d) && d > 0 && d <= 3650 &&
    !isNaN(t) && t >= 0 && t < 1;

  let gross: number | null = null;
  let taxAmt: number | null = null;
  let net: number | null = null;
  let netTotal: number | null = null;
  if (valid) {
    gross = P * ar * (d / 365);
    taxAmt = gross * t;
    net = gross - taxAmt;
    netTotal = P + net;
  }

  const fmt = (v: number) => "₺" + v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="calc-box">
      <div className="calc-row">
        <label className="calc-field">
          <span>Anapara (₺)</span>
          <input type="number" inputMode="decimal" min={0} step="any" value={principal}
            onChange={(e) => setPrincipal(e.target.value)} aria-label="Anapara" />
        </label>
        <label className="calc-field">
          <span>Yıllık Faiz (%)</span>
          <input type="number" inputMode="decimal" min={0} step="any" value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)} aria-label="Yıllık brüt faiz" />
        </label>
        <label className="calc-field">
          <span>Vade (gün)</span>
          <input type="number" inputMode="numeric" min={1} max={3650} step={1} value={days}
            onChange={(e) => setDays(e.target.value)} aria-label="Vade gün" />
        </label>
        <label className="calc-field">
          <span>Stopaj (%)</span>
          <input type="number" inputMode="decimal" min={0} max={99} step="any" value={tax}
            onChange={(e) => setTax(e.target.value)} aria-label="Stopaj oranı" />
        </label>
      </div>
      <div className="calc-result calc-result-grid" aria-live="polite">
        {!valid ? (
          <span className="conv-muted">Anapara, faiz, vade ve stopaj için geçerli değerler girin.</span>
        ) : (
          <>
            <div><span className="calc-result-lbl">Brüt Faiz</span><strong>{fmt(gross!)}</strong></div>
            <div><span className="calc-result-lbl">Stopaj Kesintisi</span><strong>{fmt(taxAmt!)}</strong></div>
            <div><span className="calc-result-lbl">Net Faiz</span><strong className="calc-out">{fmt(net!)}</strong></div>
            <div><span className="calc-result-lbl">Vade Sonu Toplam</span><strong>{fmt(netTotal!)}</strong></div>
          </>
        )}
      </div>
      <p className="conv-note">Basit faiz yöntemiyle (yıllık 365 gün) hesaplanır; banka uygulamaları ve güncel stopaj oranları farklılık gösterebilir.</p>
    </div>
  );
}
