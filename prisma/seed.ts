import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD absents, seed ignoré.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, passwordHash, role: "ADMIN" },
    });
    console.log(`Compte admin créé : ${email}`);
  } else {
    console.log("Compte admin déjà existant, rien à faire.");
  }

  const persona = await prisma.persona.findFirst();
  if (!persona) {
    await prisma.persona.create({
      data: { name: "Camille Rivière", notes: "Persona Fanvue — voir character sheet." },
    });
    console.log("Persona par défaut créée : Camille Rivière");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
