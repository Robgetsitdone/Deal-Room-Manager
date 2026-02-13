import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  FolderOpen,
  Eye,
  MousePointerClick,
  TrendingUp,
  ArrowRight,
  Clock,
  Plus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { DealRoom, DealRoomView } from "@shared/schema";

interface DashboardStats {
  totalRooms: number;
  totalViews: number;
  totalClicks: number;
  viewsThisWeek: number;
}

interface RecentActivity {
  id: string;
  viewerEmail: string | null;
  viewerName: string | null;
  dealRoomName: string;
  viewedAt: string;
  device: string | null;
}

const statCards = [
  { key: "totalRooms", label: "Total Hubs", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalViews", label: "Total Views", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "totalClicks", label: "Total Clicks", icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "viewsThisWeek", label: "This Week", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
] as const;

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: recentRooms, isLoading: roomsLoading } = useQuery<DealRoom[]>({
    queryKey: ["/api/deal-rooms"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<
    RecentActivity[]
  >({
    queryKey: ["/api/analytics/recent-activity"],
  });

  const topRooms = recentRooms?.slice(0, 5) || [];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your deal hubs.
          </p>
        </div>
        <Link href="/rooms/new">
          <Button className="shadow-sm" data-testid="button-new-room">
            <Plus className="h-4 w-4 mr-2" />
            New Deal Hub
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))
        ) : (
          statCards.map((card) => (
            <div key={card.key} className="stat-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p
                className="text-3xl font-bold mt-2 tracking-tight"
                data-testid={`text-${card.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
              >
                {stats?.[card.key] || 0}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Deal Hubs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-lg">Recent Deal Hubs</h2>
            <Link href="/rooms">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="link-view-all-rooms">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          {roomsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              ))}
            </div>
          ) : topRooms.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Create your first deal hub</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                Organize your sales materials into a single shareable link.
              </p>
              <Link href="/rooms/new">
                <Button className="shadow-sm" data-testid="button-create-first-room">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deal Hub
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {topRooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card
                    className="p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-[1px]"
                    data-testid={`card-room-${room.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              (room.brandColor || "#2563EB") + "15",
                          }}
                        >
                          <FolderOpen
                            className="h-4.5 w-4.5"
                            style={{
                              color: room.brandColor || "#2563EB",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {room.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {room.headline || "No headline"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          room.status === "published"
                            ? "default"
                            : room.status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                        className={`flex-shrink-0 capitalize ${room.status === "published" ? "badge-success border" : ""}`}
                        data-testid={`badge-status-${room.id}`}
                      >
                        {room.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No viewer activity yet. Share a hub to see engagement.
              </p>
            </Card>
          ) : (
            <Card className="divide-y">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">
                        {activity.viewerName ||
                          activity.viewerEmail ||
                          "Anonymous"}
                      </span>{" "}
                      viewed{" "}
                      <span className="font-medium text-primary">
                        {activity.dealRoomName}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.viewedAt).toLocaleString()}
                      {activity.device && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                          {activity.device}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
