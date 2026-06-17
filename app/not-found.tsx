import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-page">
      <h1 className="error-code">404</h1>
      <p className="error-text">Aradığınız sayfa bulunamadı.</p>
      <Link href="/" className="error-link">
        ← Ana Sayfaya Dön
      </Link>
    </div>
  );
}
