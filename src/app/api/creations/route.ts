import { auth } from "@/lib/auth";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { addXP, checkBadges } from "@/lib/gamification";
import { creationSchema } from "@/lib/validations";
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
    const validatedData = creationSchema.parse(body);

    // Safety: Enforce parental consent for kids wanting to go public
    let isPublic = validatedData.isPublic;
    if (session.user.role === 'kid' && !session.user.hasParentalConsent) {
        isPublic = false;
    }

    const [newCreation] = await db.insert(creations).values({
      userId: session.user.id,
      parentCreationId: validatedData.parentCreationId,
      title: validatedData.title,
      description: validatedData.description,
      type: validatedData.type,
      contentUrl: validatedData.contentUrl,
      thumbnailUrl: validatedData.thumbnailUrl,
      isPublic: isPublic,
      moderationStatus: 'pending', // Now defaults to pending for moderation
    }).returning();

    // Award XP
    const xpAmount = validatedData.parentCreationId ? 30 : 50;
    const result = await addXP(session.user.id, xpAmount);

    // Check for new badges
    const newBadges = await checkBadges(session.user.id);

    return NextResponse.json({
        ...newCreation,
        gamification: {
            ...result,
            newBadges
        }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Save creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const allCreations = await db.query.creations.findMany({
      where: (creations, { eq, and }) => {
        const filters = [
            eq(creations.isPublic, true),
            eq(creations.moderationStatus, 'approved')
        ];
        if (type) filters.push(eq(creations.type, type as 'drawing' | 'music' | 'story' | 'design'));
        return and(...filters);
      },
      with: {
        user: true,
        likes: true,
        parent: {
          with: {
            user: true
          }
        }
      },
      orderBy: (creations, { desc }) => [desc(creations.createdAt)],
    });

    return NextResponse.json(allCreations);
  } catch (error) {
    console.error("Fetch creations error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
