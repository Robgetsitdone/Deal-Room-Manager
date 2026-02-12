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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your deal rooms.
          </p>
        </div>
        <Link href="/rooms/new">
          <Button data-testid="button-new-room">
            <Plus className="h-4 w-4 mr-2" />
            New Deal Room
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-total-rooms"
              >
                {stats?.totalRooms || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Total Views</p>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-total-views"
              >
                {stats?.totalViews || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-total-clicks"
              >
                {stats?.totalClicks || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Views This Week</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-views-week"
              >
                {stats?.viewsThisWeek || 0}
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Recent Deal Rooms</h2>
            <Link href="/rooms">
              <Button variant="ghost" size="sm" data-testid="link-view-all-rooms">
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
            <Card className="p-8 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No deal rooms yet. Create your first one.
              </p>
              <Link href="/rooms/new">
                <Button className="mt-4" data-testid="button-create-first-room">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deal Room
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {topRooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer"
                    data-testid={`card-room-${room.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              (room.brandColor || "#2563EB") + "18",
                          }}
                        >
                          <FolderOpen
                            className="h-4 w-4"
                            style={{
                              color: room.brandColor || "#2563EB",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {room.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                        className="flex-shrink-0"
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

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <Card className="p-6 text-center">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No viewer activity yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {activity.viewerName ||
                          activity.viewerEmail ||
                          "Anonymous"}
                      </span>{" "}
                      viewed{" "}
                      <span className="font-medium">
                        {activity.dealRoomName}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.viewedAt).toLocaleString()}
                      {activity.device && (
                        <span className="capitalize">
                          · {activity.device}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
