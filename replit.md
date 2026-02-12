# DealBuddy Platform

## Overview
A platform for sales teams to share evaluation materials with prospects through branded, shareable "deal hubs." Users upload files to a centralized library, organize them into deal hubs with custom branding, share via unique links, and track engagement analytics.

## Recent Changes
- 2026-02-12: Rebranded website name to "DealBuddy" (friendly brand name); concept of "deal hub" retained for shareable content spaces
- 2026-02-12: Rebranded from "DealRoom" to "Deal Hub" across entire app
  - Landing page rewritten: clean messaging about sharing evaluation materials, no pricing/credit card language
  - All user-facing copy updated to "Deal Hub" terminology
- 2026-02-12: Initial full-stack implementation
  - Database schema with 7 tables (organizations, organization_members, files, deal_rooms, deal_room_assets, deal_room_views, asset_clicks)
  - All API routes with org-ownership security checks
  - Complete frontend with landing page, dashboard, hubs, file library, analytics, team, settings
  - Public share page with email gate, password protection, and view/click tracking
  - Object storage integration for file uploads (secured with auth)
  - Replit Auth for authentication
  - Dark mode support with theme toggle

## Project Architecture
- **Frontend**: React + Vite + TanStack Query + wouter + Tailwind CSS + shadcn/ui
- **Backend**: Express.js with PostgreSQL (Drizzle ORM)
- **Auth**: Replit Auth (OpenID Connect)
- **Storage**: Replit Object Storage (presigned URL uploads)
- **Database**: PostgreSQL (Neon-backed via Replit)

### Key Files
- `shared/schema.ts` - All database models and Zod schemas
- `server/routes.ts` - API endpoints (deal hubs, files, analytics, team, public share)
- `server/storage.ts` - Database storage layer (IStorage interface + DatabaseStorage)
- `client/src/App.tsx` - Main app with routing and auth gating
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/pages/` - All page components

### Data Flow
1. User logs in via Replit Auth → auto-creates org + owner membership
2. Upload files to Object Storage → register in files table
3. Create deal hub → select files as assets → configure branding/access
4. Publish hub → generates share token → copy link
5. Prospect opens link → optional email gate/password → tracks views
6. Prospect clicks assets → tracks clicks + duration
7. Admin views analytics dashboard with charts

## User Preferences
- Website/brand name: "DealBuddy" (friendly, approachable)
- Product concept: Users create "deal hubs" to share with prospects
- Landing page: Clean, professional. Focus on sharing evaluation materials. No credit card or pricing language.
