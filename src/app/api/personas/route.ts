import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const personas = await prisma.persona.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ personas });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  const { name, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "name requis" }, { status: 400 });

  const persona = await prisma.persona.create({ data: { name, notes } });
  return NextResponse.json({ persona });
}
