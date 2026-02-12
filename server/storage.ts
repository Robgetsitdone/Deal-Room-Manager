import {
  organizations,
  organizationMembers,
  files,
  dealRooms,
  dealRoomAssets,
  dealRoomViews,
  assetClicks,
  type InsertOrganization,
  type Organization,
  type InsertOrganizationMember,
  type OrganizationMember,
  type InsertFile,
  type InsertDealRoom,
  type DealRoom,
  type InsertDealRoomAsset,
  type DealRoomAsset,
  type InsertDealRoomView,
  type DealRoomView,
  type InsertAssetClick,
  type AssetClick,
} from "@shared/schema";
import type { File as FileRecord } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, count } from "drizzle-orm";

export interface IStorage {
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  updateOrganization(id: string, data: Partial<InsertOrganization>): Promise<Organization>;

  addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember>;
  getOrganizationMembers(orgId: string): Promise<OrganizationMember[]>;
  getMemberByUserId(userId: string): Promise<OrganizationMember | undefined>;
  updateMemberRole(memberId: string, role: string): Promise<OrganizationMember>;

  createFile(file: InsertFile): Promise<FileRecord>;
  getFiles(orgId: string): Promise<FileRecord[]>;
  getFile(id: string): Promise<FileRecord | undefined>;
  deleteFile(id: string): Promise<void>;

  createDealRoom(room: InsertDealRoom): Promise<DealRoom>;
  getDealRooms(orgId: string): Promise<DealRoom[]>;
  getDealRoom(id: string): Promise<DealRoom | undefined>;
  getDealRoomByToken(token: string): Promise<DealRoom | undefined>;
  updateDealRoom(id: string, data: Partial<InsertDealRoom>): Promise<DealRoom>;
  deleteDealRoom(id: string): Promise<void>;

  addDealRoomAsset(asset: InsertDealRoomAsset): Promise<DealRoomAsset>;
  getDealRoomAssets(dealRoomId: string): Promise<(DealRoomAsset & { file: FileRecord })[]>;
  updateDealRoomAsset(id: string, data: Partial<InsertDealRoomAsset>): Promise<DealRoomAsset>;
  deleteDealRoomAsset(id: string): Promise<void>;

  createDealRoomView(view: InsertDealRoomView): Promise<DealRoomView>;
  getDealRoomViews(dealRoomId: string): Promise<DealRoomView[]>;
  updateViewDuration(viewId: string, duration: number): Promise<void>;

  createAssetClick(click: InsertAssetClick): Promise<AssetClick>;

  getAnalyticsOverview(orgId: string): Promise<{
    totalRooms: number;
    totalViews: number;
    totalClicks: number;
    viewsThisWeek: number;
    topRooms: { name: string; views: number; clicks: number }[];
    viewsByDay: { date: string; views: number }[];
    deviceBreakdown: { device: string; count: number }[];
  }>;

  getRecentActivity(orgId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [result] = await db.insert(organizations).values(org).returning();
    return result;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [result] = await db.select().from(organizations).where(eq(organizations.id, id));
    return result;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [result] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return result;
  }

  async updateOrganization(id: string, data: Partial<InsertOrganization>): Promise<Organization> {
    const [result] = await db.update(organizations).set(data).where(eq(organizations.id, id)).returning();
    return result;
  }

  async addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember> {
    const [result] = await db.insert(organizationMembers).values(member).returning();
    return result;
  }

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    return db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, orgId));
  }

  async getMemberByUserId(userId: string): Promise<OrganizationMember | undefined> {
    const [result] = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId));
    return result;
  }

  async updateMemberRole(memberId: string, role: string): Promise<OrganizationMember> {
    const [result] = await db.update(organizationMembers).set({ role: role as any }).where(eq(organizationMembers.id, memberId)).returning();
    return result;
  }

  async createFile(file: InsertFile): Promise<FileRecord> {
    const [result] = await db.insert(files).values(file).returning();
    return result;
  }

  async getFiles(orgId: string): Promise<FileRecord[]> {
    return db.select().from(files).where(eq(files.organizationId, orgId)).orderBy(desc(files.createdAt));
  }

  async getFile(id: string): Promise<FileRecord | undefined> {
    const [result] = await db.select().from(files).where(eq(files.id, id));
    return result;
  }

  async deleteFile(id: string): Promise<void> {
    const usages = await db.select().from(dealRoomAssets).where(eq(dealRoomAssets.fileId, id));
    if (usages.length > 0) {
      throw new Error("File is used in active deal hubs");
    }
    await db.delete(files).where(eq(files.id, id));
  }

  async createDealRoom(room: InsertDealRoom): Promise<DealRoom> {
    const [result] = await db.insert(dealRooms).values(room).returning();
    return result;
  }

  async getDealRooms(orgId: string): Promise<DealRoom[]> {
    return db.select().from(dealRooms).where(eq(dealRooms.organizationId, orgId)).orderBy(desc(dealRooms.createdAt));
  }

  async getDealRoom(id: string): Promise<DealRoom | undefined> {
    const [result] = await db.select().from(dealRooms).where(eq(dealRooms.id, id));
    return result;
  }

  async getDealRoomByToken(token: string): Promise<DealRoom | undefined> {
    const [result] = await db.select().from(dealRooms).where(eq(dealRooms.shareToken, token));
    return result;
  }

  async updateDealRoom(id: string, data: Partial<InsertDealRoom>): Promise<DealRoom> {
    const [result] = await db.update(dealRooms).set({ ...data, updatedAt: new Date() }).where(eq(dealRooms.id, id)).returning();
    return result;
  }

  async deleteDealRoom(id: string): Promise<void> {
    await db.delete(dealRooms).where(eq(dealRooms.id, id));
  }

  async addDealRoomAsset(asset: InsertDealRoomAsset): Promise<DealRoomAsset> {
    const [result] = await db.insert(dealRoomAssets).values(asset).returning();
    return result;
  }

  async getDealRoomAssets(dealRoomId: string): Promise<(DealRoomAsset & { file: FileRecord })[]> {
    const results = await db
      .select()
      .from(dealRoomAssets)
      .innerJoin(files, eq(dealRoomAssets.fileId, files.id))
      .where(eq(dealRoomAssets.dealRoomId, dealRoomId))
      .orderBy(dealRoomAssets.order);

    return results.map((r) => ({
      ...r.deal_room_assets,
      file: r.files,
    }));
  }

  async updateDealRoomAsset(id: string, data: Partial<InsertDealRoomAsset>): Promise<DealRoomAsset> {
    const [result] = await db.update(dealRoomAssets).set(data).where(eq(dealRoomAssets.id, id)).returning();
    return result;
  }

  async deleteDealRoomAsset(id: string): Promise<void> {
    await db.delete(dealRoomAssets).where(eq(dealRoomAssets.id, id));
  }

  async createDealRoomView(view: InsertDealRoomView): Promise<DealRoomView> {
    const [result] = await db.insert(dealRoomViews).values(view).returning();
    return result;
  }

  async getDealRoomViews(dealRoomId: string): Promise<DealRoomView[]> {
    return db.select().from(dealRoomViews).where(eq(dealRoomViews.dealRoomId, dealRoomId)).orderBy(desc(dealRoomViews.viewedAt));
  }

  async updateViewDuration(viewId: string, duration: number): Promise<void> {
    await db.update(dealRoomViews).set({ duration }).where(eq(dealRoomViews.id, viewId));
  }

  async createAssetClick(click: InsertAssetClick): Promise<AssetClick> {
    const [result] = await db.insert(assetClicks).values(click).returning();
    return result;
  }

  async getAnalyticsOverview(orgId: string): Promise<{
    totalRooms: number;
    totalViews: number;
    totalClicks: number;
    viewsThisWeek: number;
    topRooms: { name: string; views: number; clicks: number }[];
    viewsByDay: { date: string; views: number }[];
    deviceBreakdown: { device: string; count: number }[];
  }> {
    const orgRooms = await db.select().from(dealRooms).where(eq(dealRooms.organizationId, orgId));
    const roomIds = orgRooms.map((r) => r.id);

    if (roomIds.length === 0) {
      return {
        totalRooms: 0,
        totalViews: 0,
        totalClicks: 0,
        viewsThisWeek: 0,
        topRooms: [],
        viewsByDay: [],
        deviceBreakdown: [],
      };
    }

    let allViews: DealRoomView[] = [];
    let allClicks: AssetClick[] = [];

    for (const roomId of roomIds) {
      const views = await db.select().from(dealRoomViews).where(eq(dealRoomViews.dealRoomId, roomId));
      allViews = allViews.concat(views);
    }

    const allAssets = await db.select().from(dealRoomAssets).where(
      sql`${dealRoomAssets.dealRoomId} = ANY(${roomIds})`
    );
    const assetIds = allAssets.map((a) => a.id);

    if (assetIds.length > 0) {
      for (const assetId of assetIds) {
        const clicks = await db.select().from(assetClicks).where(eq(assetClicks.assetId, assetId));
        allClicks = allClicks.concat(clicks);
      }
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const viewsThisWeek = allViews.filter(
      (v) => v.viewedAt && new Date(v.viewedAt) >= weekAgo
    ).length;

    const topRoomsMap = new Map<string, { name: string; views: number; clicks: number }>();
    for (const room of orgRooms) {
      const roomViews = allViews.filter((v) => v.dealRoomId === room.id).length;
      const roomAssetIds = allAssets.filter((a) => a.dealRoomId === room.id).map((a) => a.id);
      const roomClicks = allClicks.filter((c) => roomAssetIds.includes(c.assetId)).length;
      topRoomsMap.set(room.id, { name: room.name, views: roomViews, clicks: roomClicks });
    }
    const topRooms = Array.from(topRoomsMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const viewsByDayMap = new Map<string, number>();
    for (const view of allViews) {
      if (view.viewedAt) {
        const day = new Date(view.viewedAt).toISOString().split("T")[0];
        viewsByDayMap.set(day, (viewsByDayMap.get(day) || 0) + 1);
      }
    }
    const viewsByDay = Array.from(viewsByDayMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    const deviceMap = new Map<string, number>();
    for (const view of allViews) {
      const device = view.device || "unknown";
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    }
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
    }));

    return {
      totalRooms: orgRooms.length,
      totalViews: allViews.length,
      totalClicks: allClicks.length,
      viewsThisWeek,
      topRooms,
      viewsByDay,
      deviceBreakdown,
    };
  }

  async getRecentActivity(orgId: string): Promise<any[]> {
    const orgRooms = await db.select().from(dealRooms).where(eq(dealRooms.organizationId, orgId));
    const roomIds = orgRooms.map((r) => r.id);

    if (roomIds.length === 0) return [];

    let allViews: any[] = [];
    for (const roomId of roomIds) {
      const views = await db.select().from(dealRoomViews).where(eq(dealRoomViews.dealRoomId, roomId)).orderBy(desc(dealRoomViews.viewedAt)).limit(5);
      const room = orgRooms.find((r) => r.id === roomId);
      allViews = allViews.concat(
        views.map((v) => ({
          ...v,
          dealRoomName: room?.name || "Unknown",
        }))
      );
    }

    return allViews
      .sort((a, b) => {
        const aTime = a.viewedAt ? new Date(a.viewedAt).getTime() : 0;
        const bTime = b.viewedAt ? new Date(b.viewedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
  }
}

export const storage = new DatabaseStorage();
