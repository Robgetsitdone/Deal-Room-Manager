# DealRoom Platform

## Overview
A comprehensive deal room platform that enables sales teams to create branded content spaces ("deal rooms") for prospects. Users can upload files, organize them into customizable deal rooms with branding, share via unique links, and track engagement analytics.

## Recent Changes
- 2026-02-12: Initial full-stack implementation complete
  - Database schema with 7 tables (organizations, organization_members, files, deal_rooms, deal_room_assets, deal_room_views, asset_clicks)
  - All API routes with org-ownership security checks
  - Complete frontend with landing page, dashboard, rooms, file library, analytics, team, settings
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
- `server/routes.ts` - API endpoints (deal rooms, files, analytics, team, public share)
- `server/storage.ts` - Database storage layer (IStorage interface + DatabaseStorage)
- `client/src/App.tsx` - Main app with routing and auth gating
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/pages/` - All page components

### Data Flow
1. User logs in via Replit Auth → auto-creates org + owner membership
2. Upload files to Object Storage → register in files table
3. Create deal room → select files as assets → configure branding/access
4. Publish room → generates share token → copy link
5. Prospect opens link → optional email gate/password → tracks views
6. Prospect clicks assets → tracks clicks + duration
7. Admin views analytics dashboard with charts

## User Preferences
- No preferences recorded yet
