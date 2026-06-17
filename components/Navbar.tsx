"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Search from "./Search";

const CATS=[
  {k:"kripto",l:"Kripto Para"},
  {k:"borsa",l:"Borsa"},
  {k:"doviz",l:"Döviz"},
  {k:"altin",l:"Altın"},
  {k:"ekonomi",l:"Ekonomi"},
];

export default function Navbar(){
  const p=usePathname();
  return(
    <div className="nav">
      <div className="nav-brand-row">
        <Link href="/" className="nav-brand-link">
          <div className="logo-wordmark">gelecek<span>finans</span></div>
          <div className="logo-sub">Finans &amp; Ekonomi Haberleri</div>
        </Link>
        <Search/>
      </div>
      <div className="nav-cat-row">
        <Link href="/" className={`nav-cat${p==="/"?" act":""}`}>Tüm Haberler</Link>
        {CATS.map(c=> (
          <Link key={c.k} href={`/kategori/${c.k}`} className={`nav-cat${p===`/kategori/${c.k}`?" act":""}`}>{c.l}</Link>
        ))}
      </div>
    </div>
  );
}
