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
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      return Response.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.posterId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (opportunity.status !== "CLOSED") {
      return Response.json(
        { error: "Opportunity must be closed (have an accepted application) to mark complete" },
        { status: 400 }
      );
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
