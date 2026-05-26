import { auth } from "@/lib/auth";
import { db } from "@/db";
import { creations, comments } from "@/db/schema";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { moderationSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Strict Moderator check
  if (!session || session.user.role !== 'moderator') {
    return new NextResponse("Unauthorized. Moderator role required.", { status: 403 });
  }

  try {
    const body = await req.json();
    const { targetId, targetType, status } = moderationSchema.parse(body);

    if (targetType === "creation") {
        await db.update(creations)
            .set({ moderationStatus: status })
            .where(eq(creations.id, targetId));
    } else if (targetType === "comment") {
        await db.update(comments)
            .set({ isModerated: status === 'approved' }) // Simplified for comments for now
            .where(eq(comments.id, targetId));
    }

    return NextResponse.json({ success: true, targetId, status });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Moderation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session || session.user.role !== 'moderator') {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "creation";

    try {
        if (type === "creation") {
            const pendingCreations = await db.query.creations.findMany({
                where: eq(creations.moderationStatus, 'pending'),
                with: { user: true },
                orderBy: (creations, { asc }) => [asc(creations.createdAt)]
            });
            return NextResponse.json(pendingCreations);
        }
        
        return NextResponse.json([]);
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
