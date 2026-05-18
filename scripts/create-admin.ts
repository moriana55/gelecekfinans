import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@gelecekfinans.com";
  const password = process.argv[3] || "admin123";

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash, name: "Admin" },
  });

  console.log(`Admin oluşturuldu: ${user.email}`);
  console.log(`Şifre: ${password}`);
}

main().then(() => prisma.$disconnect());
