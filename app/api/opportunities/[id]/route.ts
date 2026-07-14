import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        poster: { select: { id: true, name: true, email: true } },
        applications: {
          include: {
            applicant: { select: { id: true, name: true, email: true, bio: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        rating: true,
      },
    });

    if (!opportunity) {
      return Response.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Hide emails unless a application is accepted and user is involved party
    const result = {
      ...opportunity,
      poster: {
        ...opportunity.poster,
        email:
          session?.user?.id === opportunity.posterId ||
          opportunity.applications.some(
            (p) => p.status === "ACCEPTED" && p.applicantId === session?.user?.id
          )
            ? opportunity.poster.email
            : undefined,
      },
      applications: opportunity.applications.map((p) => ({
        ...p,
        applicant: {
          ...p.applicant,
          email:
            p.status === "ACCEPTED" &&
            (session?.user?.id === opportunity.posterId ||
              session?.user?.id === p.applicantId)
              ? p.applicant.email
              : undefined,
        },
      })),
    };

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
