import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const majlisInvitesTable = pgTable("majlis_invites", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const majlisUsersTable = pgTable("majlis_users", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().unique().references(() => profilesTable.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isBanned: boolean("is_banned").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const majlisChannelsTable = pgTable("majlis_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("group"),
  createdBy: integer("created_by").references(() => majlisUsersTable.id),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const majlisChannelMembersTable = pgTable("majlis_channel_members", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => majlisChannelsTable.id),
  userId: integer("user_id").notNull().references(() => majlisUsersTable.id),
  lastReadMessageId: integer("last_read_message_id"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const majlisMessagesTable = pgTable("majlis_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => majlisUsersTable.id),
  channelId: integer("channel_id").references(() => majlisChannelsTable.id),
  content: text("content").notNull(),
  replyToId: integer("reply_to_id"),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  editedAt: timestamp("edited_at"),
});

export const majlisSessionsTable = pgTable("majlis_sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull().references(() => majlisUsersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type MajlisInvite = typeof majlisInvitesTable.$inferSelect;
export type MajlisUser = typeof majlisUsersTable.$inferSelect;
export type MajlisChannel = typeof majlisChannelsTable.$inferSelect;
export type MajlisChannelMember = typeof majlisChannelMembersTable.$inferSelect;
export type MajlisMessage = typeof majlisMessagesTable.$inferSelect;
export type MajlisSession = typeof majlisSessionsTable.$inferSelect;
