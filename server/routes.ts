import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { randomUUID } from "crypto";
import { db } from "./db";
import { assetClicks, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function getOrCreateOrgForUser(userId: string): Promise<string> {
  let member = await storage.getMemberByUserId(userId);
  if (member) return member.organizationId;

  const slug = `org-${userId.slice(0, 8)}`;
  let org = await storage.getOrganizationBySlug(slug);
  if (!org) {
    org = await storage.createOrganization({
      name: "My Organization",
      slug,
      brandColor: "#2563EB",
    });
  }

  member = await storage.addOrganizationMember({
    userId,
    organizationId: org.id,
    role: "owner",
  });

  return org.id;
}

function parseUserAgent(ua: string | undefined): string {
  if (!ua) return "unknown";
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.get("/api/deal-rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const rooms = await storage.getDealRooms(orgId);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/deal-rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const { assets, ...roomData } = req.body;

      const room = await storage.createDealRoom({
        ...roomData,
        createdById: userId,
        organizationId: orgId,
        status: "draft",
      });

      if (assets && Array.isArray(assets)) {
        for (const asset of assets) {
          await storage.addDealRoomAsset({
            dealRoomId: room.id,
            fileId: asset.fileId,
            title: asset.title,
            description: asset.description || null,
            section: asset.section || null,
            order: asset.order || 0,
          });
        }
      }

      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/deal-rooms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const room = await storage.getDealRoom(req.params.id);
      if (!room || room.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }

      const assets = await storage.getDealRoomAssets(room.id);
      const views = await storage.getDealRoomViews(room.id);

      let totalClicks = 0;
      for (const asset of assets) {
        const clicks = await db.select().from(assetClicks).where(eq(assetClicks.assetId, asset.id));
        totalClicks += clicks.length;
      }

      res.json({ ...room, assets, views, totalClicks });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/deal-rooms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const existing = await storage.getDealRoom(req.params.id);
      if (!existing || existing.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      const room = await storage.updateDealRoom(req.params.id, req.body);
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/deal-rooms/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const existing = await storage.getDealRoom(req.params.id);
      if (!existing || existing.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      const room = await storage.updateDealRoom(req.params.id, { status: "published" });
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/deal-rooms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const existing = await storage.getDealRoom(req.params.id);
      if (!existing || existing.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      await storage.deleteDealRoom(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/deal-rooms/:id/assets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const room = await storage.getDealRoom(req.params.id);
      if (!room || room.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      const asset = await storage.addDealRoomAsset({
        dealRoomId: req.params.id,
        ...req.body,
      });
      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/deal-rooms/:id/assets/:assetId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const room = await storage.getDealRoom(req.params.id);
      if (!room || room.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      const asset = await storage.updateDealRoomAsset(req.params.assetId, req.body);
      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/deal-rooms/:id/assets/:assetId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const room = await storage.getDealRoom(req.params.id);
      if (!room || room.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      await storage.deleteDealRoomAsset(req.params.assetId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const fileList = await storage.getFiles(orgId);
      res.json(fileList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const file = await storage.createFile({
        ...req.body,
        uploadedById: userId,
        organizationId: orgId,
      });
      res.json(file);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/files/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const file = await storage.getFile(req.params.id);
      if (!file || file.organizationId !== orgId) {
        return res.status(404).json({ message: "Not found" });
      }
      await storage.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/analytics/overview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const overview = await storage.getAnalyticsOverview(orgId);
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/recent-activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const activity = await storage.getRecentActivity(orgId);
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const members = await storage.getOrganizationMembers(orgId);

      const enriched = await Promise.all(
        members.map(async (m) => {
          const [user] = await db.select().from(users).where(eq(users.id, m.userId));
          return { ...m, user };
        })
      );

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const members = await storage.getOrganizationMembers(orgId);
      const targetMember = members.find((m) => m.id === req.params.id);
      if (!targetMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      const member = await storage.updateMemberRole(req.params.id, req.body.role);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const org = await storage.getOrganization(orgId);
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = await getOrCreateOrgForUser(userId);
      const org = await storage.updateOrganization(orgId, req.body);
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/share/:token", async (req, res) => {
    try {
      const room = await storage.getDealRoomByToken(req.params.token);
      if (!room) return res.status(404).json({ message: "Room not found" });
      if (room.status !== "published") return res.status(404).json({ message: "Room not available" });
      if (room.expiresAt && new Date(room.expiresAt) < new Date()) {
        return res.status(410).json({ message: "Room has expired" });
      }

      const assets = await storage.getDealRoomAssets(room.id);

      res.json({
        id: room.id,
        name: room.name,
        headline: room.headline,
        welcomeMessage: room.welcomeMessage,
        brandColor: room.brandColor,
        logoUrl: room.logoUrl,
        allowDownload: room.allowDownload,
        requireEmail: room.requireEmail,
        hasPassword: !!room.password,
        assets: assets.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          section: a.section,
          order: a.order,
          file: {
            fileName: a.file.fileName,
            fileType: a.file.fileType,
            fileSize: a.file.fileSize,
            fileUrl: a.file.fileUrl,
          },
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/share/:token/verify", async (req, res) => {
    try {
      const room = await storage.getDealRoomByToken(req.params.token);
      if (!room) return res.status(404).json({ message: "Room not found" });

      if (room.password && req.body.password !== room.password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/share/:token/track", async (req, res) => {
    try {
      const room = await storage.getDealRoomByToken(req.params.token);
      if (!room) return res.status(404).json({ message: "Room not found" });

      const ua = req.headers["user-agent"];
      const view = await storage.createDealRoomView({
        dealRoomId: room.id,
        visitorId: req.body.visitorId || randomUUID(),
        viewerEmail: req.body.viewerEmail || null,
        viewerName: req.body.viewerName || null,
        viewerCompany: req.body.viewerCompany || null,
        userAgent: ua || null,
        device: parseUserAgent(ua),
        referrer: req.headers.referer || null,
        duration: 0,
      });

      res.json({ viewId: view.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/share/:token/click", async (req, res) => {
    try {
      const { assetId, viewId } = req.body;
      if (!assetId || !viewId) {
        return res.status(400).json({ message: "Missing assetId or viewId" });
      }

      const click = await storage.createAssetClick({
        assetId,
        viewId,
        duration: 0,
        downloaded: false,
      });

      res.json(click);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/share/:token/duration", async (req, res) => {
    try {
      const { viewId, duration } = req.body;
      if (viewId && duration != null) {
        await storage.updateViewDuration(viewId, duration);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
