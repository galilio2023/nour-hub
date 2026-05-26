import { db } from "@/db";
import { user, userBadges, creations } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

export const XP_PER_LEVEL = 100;

export async function addXP(userId: string, amount: number) {
    // 1. Get current user state to calculate level up
    const currentUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { xp: true, level: true }
    });

    if (!currentUser) return;

    const oldLevel = currentUser.level;
    const newXP = (currentUser.xp || 0) + amount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > oldLevel;

    // 2. Update user XP and Level
    const [updatedUser] = await db.update(user)
        .set({ 
            xp: newXP,
            level: newLevel
        })
        .where(eq(user.id, userId))
        .returning({ 
            xp: user.xp,
            level: user.level 
        });

    if (!updatedUser) return;

    return {
        newLevel: updatedUser.level,
        newXP: updatedUser.xp,
        leveledUp
    };
}


export async function checkBadges(userId: string) {
    const userCreations = await db.query.creations.findMany({
        where: eq(creations.userId, userId),
        with: { likes: true }
    });

    const earnedBadges = await db.query.userBadges.findMany({
        where: eq(userBadges.userId, userId),
    });

    const newBadges: string[] = [];
    const earnedIds = new Set(earnedBadges.map(b => b.badgeId));

    // Helper to award a badge
    const award = async (id: string) => {
        if (!earnedIds.has(id)) {
            await db.insert(userBadges).values({ userId, badgeId: id });
            newBadges.push(id);
        }
    };

    // 1. Badge: First Creation
    if (userCreations.length >= 1) {
        await award('first-creation');
    }

    // 2. Badge: Remix Artist (Created a remix)
    const hasRemix = await db.query.creations.findFirst({
        where: and(eq(creations.userId, userId), sql`${creations.parentCreationId} IS NOT NULL`)
    });
    if (hasRemix) {
        await award('remix-artist');
    }

    // 3. Badge: Popular Artist (10 total likes across all creations)
    const totalLikes = userCreations.reduce((acc, c) => acc + (c.likes?.length || 0), 0);
    if (totalLikes >= 10) {
        await award('popular-artist');
    }

    return newBadges;
}
