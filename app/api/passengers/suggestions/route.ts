import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUserId(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  const id = Number(payload?.userId);
  return Number.isNaN(id) ? null : id;
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ suggestions: [] });

  try {
    const passengers = await prisma.passenger.findMany({
      where: {
        booking: { userId },
      },
      select: {
        name: true,
        mobile: true,
        gender: true,
        age: true,
        booking: { select: { createdAt: true } },
      },
      orderBy: {
        booking: { createdAt: "desc" },
      },
      take: 200,
    });

    const unique = new Map<
      string,
      { name: string; mobile: string; gender: string; age: number | null }
    >();
    for (const p of passengers) {
      const name = (p.name || "").trim();
      const mobile = (p.mobile || "").trim();
      const gender = (p.gender || "").trim();
      const age = p.age ?? null;
      if (!name) continue;

      const key = `${name.toLowerCase()}|${mobile}`;
      if (!unique.has(key)) {
        unique.set(key, { name, mobile, gender, age });
      }
      if (unique.size >= 20) break;
    }

    return NextResponse.json({ suggestions: Array.from(unique.values()) });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
