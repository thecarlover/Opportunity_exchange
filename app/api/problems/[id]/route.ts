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
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true } },
        proposals: {
          include: {
            provider: { select: { id: true, name: true, email: true, bio: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        rating: true,
      },
    });

    if (!problem) {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }

    // Hide emails unless a proposal is accepted and user is involved party
    const result = {
      ...problem,
      business: {
        ...problem.business,
        email:
          session?.user?.id === problem.businessId ||
          problem.proposals.some(
            (p) => p.status === "ACCEPTED" && p.providerId === session?.user?.id
          )
            ? problem.business.email
            : undefined,
      },
      proposals: problem.proposals.map((p) => ({
        ...p,
        provider: {
          ...p.provider,
          email:
            p.status === "ACCEPTED" &&
            (session?.user?.id === problem.businessId ||
              session?.user?.id === p.providerId)
              ? p.provider.email
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
