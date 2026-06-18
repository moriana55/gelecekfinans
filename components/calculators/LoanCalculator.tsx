"use client";
import { useState } from "react";

/**
 * Kredi taksit hesaplayıcı (anüite). Saf client, bağımlılıksız.
 * Aylık taksit = P·r·(1+r)^n / ((1+r)^n − 1), r = aylık faiz oranı.
 */
export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("3.5"); // aylık %
  const [months, setMonths] = useState("12");

  const P = parseFloat(principal.replace(",", "."));
  const r = parseFloat(rate.replace(",", ".")) / 100;
  const n = parseInt(months);
  const valid =
    !isNaN(P) && P > 0 && isFinite(P) &&
    !isNaN(r) && r >= 0 && isFinite(r) &&
    !isNaN(n) && n > 0 && n <= 600;

  let monthly: number | null = null;
  let total: number | null = null;
  let interest: number | null = null;
  if (valid) {
    if (r === 0) {
      monthly = P / n;
    } else {
      const f = Math.pow(1 + r, n);
      monthly = (P * r * f) / (f - 1);
    }
    total = monthly * n;
    interest = total - P;
  }

  const fmt = (v: number) => "₺" + v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="calc-box">
      <div className="calc-row">
        <label className="calc-field">
          <span>Kredi Tutarı (₺)</span>
          <input type="number" inputMode="decimal" min={0} step="any" value={principal}
            onChange={(e) => setPrincipal(e.target.value)} aria-label="Kredi tutarı" />
        </label>
        <label className="calc-field">
          <span>Aylık Faiz (%)</span>
          <input type="number" inputMode="decimal" min={0} step="any" value={rate}
            onChange={(e) => setRate(e.target.value)} aria-label="Aylık faiz oranı" />
        </label>
        <label className="calc-field">
          <span>Vade (ay)</span>
          <input type="number" inputMode="numeric" min={1} max={600} step={1} value={months}
            onChange={(e) => setMonths(e.target.value)} aria-label="Vade ay sayısı" />
        </label>
      </div>
      <div className="calc-result calc-result-grid" aria-live="polite">
        {!valid ? (
          <span className="conv-muted">Tutar, faiz ve vade için geçerli değerler girin.</span>
        ) : (
          <>
            <div><span className="calc-result-lbl">Aylık Taksit</span><strong className="calc-out">{fmt(monthly!)}</strong></div>
            <div><span className="calc-result-lbl">Toplam Geri Ödeme</span><strong>{fmt(total!)}</strong></div>
            <div><span className="calc-result-lbl">Toplam Faiz</span><strong>{fmt(interest!)}</strong></div>
          </>
        )}
      </div>
      <p className="conv-note">Sonuçlar anüite (eşit taksit) yöntemiyle hesaplanır; KKDF, BSMV ve dosya masrafları dahil değildir.</p>
    </div>
  );
}
