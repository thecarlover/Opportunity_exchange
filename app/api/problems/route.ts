import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  budget: z.string().min(1),
  timeline: z.string().min(1),
});

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      where: { status: "OPEN" },
      include: {
        business: { select: { name: true, id: true } },
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(problems);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProblemSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const problem = await prisma.problem.create({
      data: {
        ...parsed.data,
        businessId: session.user.id,
      },
    });

    return Response.json(problem, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
