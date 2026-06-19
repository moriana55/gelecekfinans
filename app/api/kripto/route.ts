import { NextResponse } from "next/server";
export async function GET(){
  try{
    const res=await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&order=market_cap_desc&per_page=20&sparkline=true&price_change_percentage=24h",{next:{revalidate:60}});
    return NextResponse.json(await res.json(),{headers:{"Cache-Control":"s-maxage=60,stale-while-revalidate=30"}});
  }catch{return NextResponse.json([]);}
}
