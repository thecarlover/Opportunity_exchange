import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@/lib/generated/prisma/enums";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["BUSINESS", "SOLUTION_PROVIDER"]),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, bio } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as Role,
        bio: bio ?? "",
      },
    });

    return Response.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: "Internal server error", details: err?.message || String(err) }, { status: 500 });
  }
}
