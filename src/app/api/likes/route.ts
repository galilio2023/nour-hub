import { auth } from "@/lib/auth";
import { db } from "@/db";
import { likes, creations } from "@/db/schema";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { addXP, checkBadges } from "@/lib/gamification";
import { likeSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { creationId } = likeSchema.parse(body);

    // Check if already liked
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.creationId, creationId),
        eq(likes.userId, session.user.id)
      ),
    });

    if (existingLike) {
        // Unlike
        await db.delete(likes).where(
            and(
                eq(likes.creationId, creationId),
                eq(likes.userId, session.user.id)
            )
        );
        return NextResponse.json({ liked: false });
    }

    // Like
    await db.insert(likes).values({
      userId: session.user.id,
      creationId,
    });

    // Award XP to the creator
    const targetCreation = await db.query.creations.findFirst({
        where: eq(creations.id, creationId),
        columns: { userId: true }
    });

    if (targetCreation && targetCreation.userId !== session.user.id) {
        await addXP(targetCreation.userId, 10);
        await checkBadges(targetCreation.userId);
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Like toggle error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
