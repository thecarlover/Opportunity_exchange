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
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        proposals: { where: { status: "ACCEPTED" } },
      },
    });

    if (!problem) {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }
    if (problem.businessId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (problem.status !== "COMPLETED") {
      return Response.json(
        { error: "Problem must be marked completed before rating" },
        { status: 400 }
      );
    }

    const acceptedProposal = problem.proposals[0];
    if (!acceptedProposal) {
      return Response.json({ error: "No accepted proposal found" }, { status: 400 });
    }

    const existingRating = await prisma.rating.findUnique({ where: { problemId: id } });
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
        problemId: id,
        providerId: acceptedProposal.providerId,
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
