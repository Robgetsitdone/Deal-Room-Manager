# DealBuddy Platform

## Overview
A platform for sales teams to share evaluation materials with prospects through branded, shareable "deal hubs." Users upload files to a centralized library, organize them into deal hubs with custom branding, share via unique links, and track engagement analytics.

## Recent Changes
- 2026-02-13: Added deal hub sharing, editing, and comments features
  - Comments system: deal_room_comments table with seller/prospect roles, API routes for authenticated and public comment posting
  - Enhanced room-detail page: share link card (always visible), preview button, inline settings editor, drag-and-drop asset reordering, move up/down buttons, inline asset editing (title/description/section), add files from library, comments tab
  - Enhanced public share page: right-side sliding comments panel where prospects and sellers can exchange messages, auto-refresh every 15s
  - Asset reorder API: PUT /api/deal-rooms/:id/assets/reorder with orderedIds array
- 2026-02-13: Fixed XHR upload: added withCredentials for cookie auth, 120s timeout, proper error messages
- 2026-02-12: Rebranded website name to "DealBuddy" (friendly brand name); concept of "deal hub" retained for shareable content spaces
- 2026-02-12: Initial full-stack implementation
  - Database schema with 8 tables (organizations, organization_members, files, deal_rooms, deal_room_assets, deal_room_views, asset_clicks, deal_room_comments)
  - All API routes with org-ownership security checks
  - Complete frontend with landing page, dashboard, hubs, file library, analytics, team, settings
  - Public share page with email gate, password protection, view/click tracking, and comments
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
