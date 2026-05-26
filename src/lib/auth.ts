import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins/username";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        username()
    ],
    user: {
        additionalFields: {
            bio: {
                type: "string",
                required: false,
            },
            birthYear: {
                type: "number",
                required: false,
            },
            role: {
                type: "string",
                required: false,
            },
            isVerified: {
                type: "boolean",
                required: false,
            },
            hasParentalConsent: {
                type: "boolean",
                required: false,
            },
            xp: {
                type: "number",
                required: false,
            },
            level: {
                type: "number",
                required: false,
            },
            avatarState: {
                type: "string",
                required: false,
            }
        }
    }
});
