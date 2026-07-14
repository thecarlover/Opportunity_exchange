import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  const { id, applicationId } = await params;
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
    if (opportunity.status !== "OPEN") {
      return Response.json({ error: "Opportunity is not open" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.opportunityId !== id) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    // Reject all other applications, accept this one
    await prisma.application.updateMany({
      where: { opportunityId: id, id: { not: applicationId } },
      data: { status: "REJECTED" },
    });

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    await prisma.opportunity.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
