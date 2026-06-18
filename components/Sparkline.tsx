/**
 * CLS-güvenli, bağımlılıksız SVG sparkline. Sabit viewBox + preserveAspectRatio
 * sayesinde alan rezerve edilir; veri yokken bile yükseklik korunur.
 */
interface Props {
  data: number[] | null;
  up?: boolean;
  width?: number;
  height?: number;
  label?: string;
}

export default function Sparkline({ data, up = true, width = 320, height = 72, label }: Props) {
  const stroke = up ? "var(--up)" : "var(--dn)";
  let path = "";
  if (data && data.length > 1) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    path = data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * (height - 6) - 3;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }
  return (
    <div className="spark-wrap" style={{ aspectRatio: `${width} / ${height}` }}>
      {path ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label || "Fiyat grafiği"}
          className="spark-svg"
        >
          <path d={path} fill="none" stroke={stroke} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <div className="spark-empty" aria-hidden="true">grafik verisi yok</div>
      )}
    </div>
  );
}
