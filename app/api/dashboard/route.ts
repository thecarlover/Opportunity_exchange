import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [problems, proposals] = await Promise.all([
      prisma.problem.findMany({
        where: { businessId: session.user.id },
        include: {
          _count: { select: { proposals: true } },
          proposals: {
            where: { status: "ACCEPTED" },
            include: {
              provider: { select: { name: true, email: true } },
            },
          },
          rating: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.proposal.findMany({
        where: { providerId: session.user.id },
        include: {
          problem: {
            include: {
              business: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    return Response.json({ role: session.user.role, problems, proposals });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
