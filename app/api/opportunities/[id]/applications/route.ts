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
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      return Response.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const where =
      session.user.id === opportunity.posterId
        ? { opportunityId: id }
        : { opportunityId: id, applicantId: session.user.id };

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: { select: { id: true, name: true, bio: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(applications);
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
    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity || opportunity.status !== "OPEN") {
      return Response.json({ error: "Opportunity not open" }, { status: 400 });
    }
    if (opportunity.posterId === session.user.id) {
      return Response.json({ error: "You cannot submit a application for your own opportunity" }, { status: 400 });
    }

    const existing = await prisma.application.findFirst({
      where: { opportunityId: id, applicantId: session.user.id },
    });
    if (existing) {
      return Response.json(
        { error: "You already submitted a application for this opportunity" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = proposalSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        ...parsed.data,
        opportunityId: id,
        applicantId: session.user.id,
      },
    });

    return Response.json(application, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
