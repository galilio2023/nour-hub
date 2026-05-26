import { pgTable, text, timestamp, boolean, integer, uuid, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for roles, creation types, and moderation status
export const roleEnum = pgEnum('role', ['kid', 'parent_guardian', 'educator', 'moderator']);
export const creationTypeEnum = pgEnum('creation_type', ['drawing', 'music', 'story', 'design']);
export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'approved', 'rejected', 'removed']);

// --- Family & Guardianship ---
export const familyRelationships = pgTable('family_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: text('parentId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  childId: text('childId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  relationshipType: text('relationshipType').default('parent'), // parent, guardian, educator
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const familyRelationshipsRelations = relations(familyRelationships, ({ one }) => ({
  parent: one(user, {
    fields: [familyRelationships.parentId],
    references: [user.id],
    relationName: 'parent_to_children',
  }),
  child: one(user, {
    fields: [familyRelationships.childId],
    references: [user.id],
    relationName: 'child_to_parents',
  }),
}));

// --- Better Auth Tables ---
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  
  // Custom User Fields
  username: text('username').unique(),
  displayUsername: text('displayUsername'),
  bio: text('bio'),
  birthYear: integer('birthYear'),
  role: roleEnum('role').default('kid'),
  isVerified: boolean('isVerified').default(false),
  hasParentalConsent: boolean('hasParentalConsent').default(false),
  
  // Gamification Fields
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  avatarState: text('avatarState'),
});

export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  description: text('description'),
});

export const userBadges = pgTable('user_badges', {
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  badgeId: text('badgeId').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earnedAt').defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  creations: many(creations),
  comments: many(comments),
  likes: many(likes),
  badges: many(userBadges),
  children: many(familyRelationships, { relationName: 'parent_to_children' }),
  parents: many(familyRelationships, { relationName: 'child_to_parents' }),
}));

export const badgeRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(user, {
    fields: [userBadges.userId],
    references: [user.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

// --- Application Tables ---

export const creations = pgTable('creations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  parentCreationId: uuid('parentCreationId').references((): AnyPgColumn => creations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  type: creationTypeEnum('type').notNull(),
  contentUrl: text('contentUrl'), // S3 URL or JSON data for canvas
  thumbnailUrl: text('thumbnailUrl'),
  isPublic: boolean('isPublic').default(false),
  moderationStatus: moderationStatusEnum('moderationStatus').default('pending'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const creationsRelations = relations(creations, ({ one, many }) => ({
  user: one(user, {
    fields: [creations.userId],
    references: [user.id],
  }),
  parent: one(creations, {
    fields: [creations.parentCreationId],
    references: [creations.id],
    relationName: 'remixes',
  }),
  remixes: many(creations, { relationName: 'remixes' }),
  comments: many(comments),
  likes: many(likes),
}));

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  creationId: uuid('creationId').notNull().references(() => creations.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isModerated: boolean('isModerated').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  creation: one(creations, {
    fields: [comments.creationId],
    references: [creations.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
}));

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  creationId: uuid('creationId').notNull().references(() => creations.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  creation: one(creations, {
    fields: [likes.creationId],
    references: [creations.id],
  }),
  user: one(user, {
    fields: [likes.userId],
    references: [user.id],
  }),
}));
