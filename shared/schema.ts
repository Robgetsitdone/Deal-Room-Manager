export * from "./models/auth";

import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "member"]);
export const dealRoomStatusEnum = pgEnum("deal_room_status", [
  "draft",
  "published",
  "expired",
  "archived",
]);

export const organizations = pgTable("organizations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").default("#2563EB"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  role: userRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedById: varchar("uploaded_by_id")
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealRooms = pgTable("deal_rooms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  headline: text("headline"),
  welcomeMessage: text("welcome_message"),
  brandColor: text("brand_color"),
  logoUrl: text("logo_url"),
  status: dealRoomStatusEnum("status").default("draft").notNull(),
  shareToken: varchar("share_token")
    .notNull()
    .unique()
    .default(sql`gen_random_uuid()`),
  requireEmail: boolean("require_email").default(false).notNull(),
  password: text("password"),
  allowDownload: boolean("allow_download").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdById: varchar("created_by_id")
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dealRoomAssets = pgTable("deal_room_assets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dealRoomId: varchar("deal_room_id")
    .notNull()
    .references(() => dealRooms.id, { onDelete: "cascade" }),
  fileId: varchar("file_id")
    .notNull()
    .references(() => files.id),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  section: text("section"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealRoomViews = pgTable("deal_room_views", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dealRoomId: varchar("deal_room_id")
    .notNull()
    .references(() => dealRooms.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id").notNull(),
  viewerEmail: text("viewer_email"),
  viewerName: text("viewer_name"),
  viewerCompany: text("viewer_company"),
  userAgent: text("user_agent"),
  device: text("device"),
  referrer: text("referrer"),
  duration: integer("duration"),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const assetClicks = pgTable("asset_clicks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id")
    .notNull()
    .references(() => dealRoomAssets.id, { onDelete: "cascade" }),
  viewId: varchar("view_id")
    .notNull()
    .references(() => dealRoomViews.id, { onDelete: "cascade" }),
  duration: integer("duration"),
  downloaded: boolean("downloaded").default(false).notNull(),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  dealRooms: many(dealRooms),
  files: many(files),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
  })
);

export const filesRelations = relations(files, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [files.uploadedById],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [files.organizationId],
    references: [organizations.id],
  }),
  dealRoomAssets: many(dealRoomAssets),
}));

export const dealRoomsRelations = relations(dealRooms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [dealRooms.createdById],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [dealRooms.organizationId],
    references: [organizations.id],
  }),
  assets: many(dealRoomAssets),
  views: many(dealRoomViews),
  comments: many(dealRoomComments),
}));

export const dealRoomAssetsRelations = relations(
  dealRoomAssets,
  ({ one, many }) => ({
    dealRoom: one(dealRooms, {
      fields: [dealRoomAssets.dealRoomId],
      references: [dealRooms.id],
    }),
    file: one(files, {
      fields: [dealRoomAssets.fileId],
      references: [files.id],
    }),
    clicks: many(assetClicks),
  })
);

export const dealRoomViewsRelations = relations(
  dealRoomViews,
  ({ one, many }) => ({
    dealRoom: one(dealRooms, {
      fields: [dealRoomViews.dealRoomId],
      references: [dealRooms.id],
    }),
    assetClicks: many(assetClicks),
  })
);

export const commentRoleEnum = pgEnum("comment_role", ["seller", "prospect"]);

export const dealRoomComments = pgTable("deal_room_comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dealRoomId: varchar("deal_room_id")
    .notNull()
    .references(() => dealRooms.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  authorRole: commentRoleEnum("author_role").notNull(),
  authorUserId: varchar("author_user_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assetClicksRelations = relations(assetClicks, ({ one }) => ({
  asset: one(dealRoomAssets, {
    fields: [assetClicks.assetId],
    references: [dealRoomAssets.id],
  }),
  view: one(dealRoomViews, {
    fields: [assetClicks.viewId],
    references: [dealRoomViews.id],
  }),
}));

export const dealRoomCommentsRelations = relations(dealRoomComments, ({ one }) => ({
  dealRoom: one(dealRooms, {
    fields: [dealRoomComments.dealRoomId],
    references: [dealRooms.id],
  }),
}));

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});
export const insertOrganizationMemberSchema = createInsertSchema(
  organizationMembers
).omit({ id: true, createdAt: true });
export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});
export const insertDealRoomSchema = createInsertSchema(dealRooms).omit({
  id: true,
  shareToken: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDealRoomAssetSchema = createInsertSchema(
  dealRoomAssets
).omit({ id: true, createdAt: true });
export const insertDealRoomViewSchema = createInsertSchema(dealRoomViews).omit({
  id: true,
  viewedAt: true,
});
export const insertAssetClickSchema = createInsertSchema(assetClicks).omit({
  id: true,
  clickedAt: true,
});
export const insertDealRoomCommentSchema = createInsertSchema(dealRoomComments).omit({
  id: true,
  createdAt: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganizationMember = z.infer<
  typeof insertOrganizationMemberSchema
>;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertDealRoom = z.infer<typeof insertDealRoomSchema>;
export type DealRoom = typeof dealRooms.$inferSelect;
export type InsertDealRoomAsset = z.infer<typeof insertDealRoomAssetSchema>;
export type DealRoomAsset = typeof dealRoomAssets.$inferSelect;
export type InsertDealRoomView = z.infer<typeof insertDealRoomViewSchema>;
export type DealRoomView = typeof dealRoomViews.$inferSelect;
export type InsertAssetClick = z.infer<typeof insertAssetClickSchema>;
export type AssetClick = typeof assetClicks.$inferSelect;
export type InsertDealRoomComment = z.infer<typeof insertDealRoomCommentSchema>;
export type DealRoomComment = typeof dealRoomComments.$inferSelect;
