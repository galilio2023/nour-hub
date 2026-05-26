import { z } from "zod";

export const creationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  type: z.enum(["drawing", "music", "story", "design"]),
  contentUrl: z.string().min(1, "Content is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  parentCreationId: z.string().uuid("Invalid parent creation ID").optional().nullable(),
  isPublic: z.boolean().default(true),
});

export type CreationInput = z.infer<typeof creationSchema>;

export const likeSchema = z.object({
  creationId: z.string().uuid("Invalid creation ID"),
});

export type LikeInput = z.infer<typeof likeSchema>;

export const moderationSchema = z.object({
  targetId: z.string().uuid("Invalid target ID"),
  targetType: z.enum(["creation", "comment"]),
  status: z.enum(["approved", "rejected", "removed"]),
  reason: z.string().max(200, "Reason is too long").optional(),
});

export type ModerationInput = z.infer<typeof moderationSchema>;

export const commentSchema = z.object({
  creationId: z.string().uuid("Invalid creation ID"),
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});

export type CommentInput = z.infer<typeof commentSchema>;
