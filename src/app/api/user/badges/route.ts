import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userBadges } from "@/db/schema";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const badges = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, session.user.id),
      with: {
        badge: true,
      },
      orderBy: (userBadges, { desc }) => [desc(userBadges.earnedAt)],
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Fetch user badges error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
