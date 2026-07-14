import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

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
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        applications: { where: { status: "ACCEPTED" } },
      },
    });

    if (!opportunity) {
      return Response.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.posterId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (opportunity.status !== "COMPLETED") {
      return Response.json(
        { error: "Opportunity must be marked completed before rating" },
        { status: 400 }
      );
    }

    const acceptedProposal = opportunity.applications[0];
    if (!acceptedProposal) {
      return Response.json({ error: "No accepted application found" }, { status: 400 });
    }

    const existingRating = await prisma.rating.findUnique({ where: { opportunityId: id } });
    if (existingRating) {
      return Response.json({ error: "Already rated" }, { status: 409 });
    }

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: {
        opportunityId: id,
        userId: acceptedProposal.applicantId,
        stars: parsed.data.stars,
        comment: parsed.data.comment ?? "",
      },
    });

    return Response.json(rating, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
