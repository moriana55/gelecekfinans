"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-page">
      <h1 className="error-title">Bir hata oluştu</h1>
      <p className="error-text">Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
      <button onClick={reset} className="error-btn">
        Tekrar Dene
      </button>
    </div>
  );
}
