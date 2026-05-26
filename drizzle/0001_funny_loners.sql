CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"userId" text NOT NULL,
	"badgeId" text NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creations" ADD COLUMN "parentCreationId" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatarState" text;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_badges_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creations" ADD CONSTRAINT "creations_parentCreationId_creations_id_fk" FOREIGN KEY ("parentCreationId") REFERENCES "public"."creations"("id") ON DELETE set null ON UPDATE no action;