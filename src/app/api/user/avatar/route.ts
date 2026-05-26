import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { color, accessory } = body;

        if (!color) {
            return new NextResponse("Missing color", { status: 400 });
        }

        const avatarState = JSON.stringify({ color, accessory: accessory || 'none' });

        await db.update(user)
            .set({ avatarState })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true, avatarState });
    } catch (error) {
        console.error("Avatar Update Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
