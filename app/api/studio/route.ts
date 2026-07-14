import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [opportunities, applications] = await Promise.all([
      prisma.opportunity.findMany({
        where: { posterId: session.user.id },
        include: {
          _count: { select: { applications: true } },
          applications: {
            where: { status: "ACCEPTED" },
            include: {
              applicant: { select: { name: true, email: true } },
            },
          },
          rating: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: { applicantId: session.user.id },
        include: {
          opportunity: {
            include: {
              poster: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    return Response.json({ role: session.user.role, opportunities, applications });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
