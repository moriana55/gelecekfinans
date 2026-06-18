"use client";
import { useState } from "react";

/**
 * Enflasyon hesaplayıcı: kümülatif enflasyon oranıyla bir tutarın alım gücünü
 * ve güncel karşılığını hesaplar. Kullanıcı toplam enflasyon yüzdesini girer.
 * Saf client, bağımlılıksız.
 */
export default function InflationCalculator() {
  const [amount, setAmount] = useState("10000");
  const [totalInflation, setTotalInflation] = useState("65"); // dönem kümülatif %

  const A = parseFloat(amount.replace(",", "."));
  const inf = parseFloat(totalInflation.replace(",", ".")) / 100;
  const valid = !isNaN(A) && A > 0 && isFinite(A) && !isNaN(inf) && inf > -1 && isFinite(inf);

  let adjusted: number | null = null; // güncel karşılık (nominal eşdeğer)
  let purchasingPower: number | null = null; // bugünkü alım gücü
  if (valid) {
    adjusted = A * (1 + inf);
    purchasingPower = A / (1 + inf);
  }

  const fmt = (v: number) => "₺" + v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="calc-box">
      <div className="calc-row">
        <label className="calc-field">
          <span>Tutar (₺)</span>
          <input type="number" inputMode="decimal" min={0} step="any" value={amount}
            onChange={(e) => setAmount(e.target.value)} aria-label="Başlangıç tutarı" />
        </label>
        <label className="calc-field">
          <span>Dönem Enflasyonu (%)</span>
          <input type="number" inputMode="decimal" step="any" value={totalInflation}
            onChange={(e) => setTotalInflation(e.target.value)} aria-label="Toplam enflasyon oranı" />
        </label>
      </div>
      <div className="calc-result calc-result-grid" aria-live="polite">
        {!valid ? (
          <span className="conv-muted">Tutar ve enflasyon oranı için geçerli değerler girin.</span>
        ) : (
          <>
            <div>
              <span className="calc-result-lbl">Enflasyona Göre Güncel Karşılık</span>
              <strong className="calc-out">{fmt(adjusted!)}</strong>
              <span className="conv-muted">Aynı alım gücü için bugün gereken tutar.</span>
            </div>
            <div>
              <span className="calc-result-lbl">Bugünkü Alım Gücü</span>
              <strong>{fmt(purchasingPower!)}</strong>
              <span className="conv-muted">Bu tutarın bugünkü reel değeri.</span>
            </div>
          </>
        )}
      </div>
      <p className="conv-note">Hesaplama girilen kümülatif enflasyon oranına dayanır; resmi TÜİK verileri için ilgili kurum yayınlarını esas alın.</p>
    </div>
  );
}
