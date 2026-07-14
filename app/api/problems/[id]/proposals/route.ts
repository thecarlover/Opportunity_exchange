import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const proposalSchema = z.object({
  message: z.string().min(1),
  price: z.string().min(1),
  timeline: z.string().min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }

    const where =
      session.user.id === problem.businessId
        ? { problemId: id }
        : { problemId: id, providerId: session.user.id };

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        provider: { select: { id: true, name: true, bio: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(proposals);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem || problem.status !== "OPEN") {
      return Response.json({ error: "Problem not open" }, { status: 400 });
    }
    if (problem.businessId === session.user.id) {
      return Response.json({ error: "You cannot submit a proposal for your own problem" }, { status: 400 });
    }

    const existing = await prisma.proposal.findFirst({
      where: { problemId: id, providerId: session.user.id },
    });
    if (existing) {
      return Response.json(
        { error: "You already submitted a proposal for this problem" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = proposalSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        ...parsed.data,
        problemId: id,
        providerId: session.user.id,
      },
    });

    return Response.json(proposal, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
