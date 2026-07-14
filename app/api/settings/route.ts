import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, skills, image } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        skills: Array.isArray(skills) ? skills : [],
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        image: true,
        skills: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
