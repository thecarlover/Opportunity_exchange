import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const { id, proposalId } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }
    if (problem.businessId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (problem.status !== "OPEN") {
      return Response.json({ error: "Problem is not open" }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    if (!proposal || proposal.problemId !== id) {
      return Response.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Reject all other proposals, accept this one
    await prisma.proposal.updateMany({
      where: { problemId: id, id: { not: proposalId } },
      data: { status: "REJECTED" },
    });

    const updated = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: "ACCEPTED" },
    });

    await prisma.problem.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
