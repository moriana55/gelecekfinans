import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { rateLimit } from "./rate-limit";

/**
 * NextAuth Credentials req'inden istemci IP'sini çıkarır.
 * Buradaki headers düz bir nesnedir (fetch Request değil), bu yüzden
 * lib/rate-limit'teki clientIp helper'ı yerine elle okuyoruz.
 */
function loginClientIp(req?: { headers?: Record<string, string> | undefined }): string {
  const h = req?.headers ?? {};
  const xff = h["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return h["x-real-ip"] || "unknown";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // IP-bazlı login deneme sınırı: brute-force'u yavaşlatır.
        // 15 dakikada en fazla 5 deneme; aşılırsa giriş reddedilir.
        const ip = loginClientIp(req as { headers?: Record<string, string> });
        const rl = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
        if (!rl.ok) {
          throw new Error("Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.");
        }

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/sys-k3m8p/giris" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
