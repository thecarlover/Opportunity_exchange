import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
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
    if (problem.businessId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (problem.status !== "CLOSED") {
      return Response.json(
        { error: "Problem must be closed (have an accepted proposal) to mark complete" },
        { status: 400 }
      );
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
