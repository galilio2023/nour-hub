import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { addXP } from "@/lib/gamification";
import { commentSchema } from "@/lib/validations";
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
    const { creationId, content } = commentSchema.parse(body);

    const [newComment] = await db.insert(comments).values({
      userId: session.user.id,
      creationId,
      content,
      isModerated: false, // Default to unmoderated
    }).returning();

    // Award XP
    await addXP(session.user.id, 5);

    return NextResponse.json(newComment);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Post comment error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creationId = searchParams.get("creationId");

  if (!creationId) {
    return new NextResponse("Missing creationId", { status: 400 });
  }

  try {
    const allComments = await db.query.comments.findMany({
      where: and(
          eq(comments.creationId, creationId),
          eq(comments.isModerated, true)
      ),
      with: {
        user: true,
      },
      orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    });

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
