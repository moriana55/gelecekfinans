"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState("");

  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then(d => { if (d.ga4Id) setGaId(d.ga4Id); })
      .catch(() => {});
  }, []);

  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
