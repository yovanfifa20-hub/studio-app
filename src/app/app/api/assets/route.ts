import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId") || undefined;
  const search = searchParams.get("search") || undefined;

  const assets = await prisma.asset.findMany({
    where: {
      personaId,
      prompt: search ? { contains: search, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { persona: true, batch: { include: { createdBy: { select: { name: true } } } } },
  });

  return NextResponse.json({ assets });
}
