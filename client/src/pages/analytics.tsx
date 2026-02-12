import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  FolderOpen,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DealRoom } from "@shared/schema";

interface AnalyticsOverview {
  totalRooms: number;
  totalViews: number;
  totalClicks: number;
  viewsThisWeek: number;
  topRooms: { name: string; views: number; clicks: number }[];
  viewsByDay: { date: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

const CHART_COLORS = [
  "hsl(217, 91%, 52%)",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 48%)",
  "hsl(32, 98%, 48%)",
  "hsl(340, 82%, 52%)",
];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track engagement across all your deal rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
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
                <p className="text-sm text-muted-foreground">Active Rooms</p>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-active-rooms">
                {analytics?.totalRooms || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Total Views</p>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-analytics-views"
              >
                {analytics?.totalViews || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-analytics-clicks"
              >
                {analytics?.totalClicks || 0}
              </p>
            </Card>
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm text-muted-foreground">This Week</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p
                className="text-2xl font-bold"
                data-testid="text-analytics-week"
              >
                {analytics?.viewsThisWeek || 0}
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <h3 className="font-semibold">Views Over Time</h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : analytics?.viewsByDay && analytics.viewsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.viewsByDay}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="views"
                  fill="hsl(217, 91%, 52%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No view data yet
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-semibold">Devices</h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : analytics?.deviceBreakdown &&
            analytics.deviceBreakdown.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={analytics.deviceBreakdown}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {analytics.deviceBreakdown.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {analytics.deviceBreakdown.map((d, i) => (
                  <div
                    key={d.device}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="capitalize text-muted-foreground">
                        {d.device || "Unknown"}
                      </span>
                    </div>
                    <span className="font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No device data</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Top Deal Rooms</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : analytics?.topRooms && analytics.topRooms.length > 0 ? (
          <div className="space-y-2">
            {analytics.topRooms.map((room, i) => (
              <div
                key={room.name}
                className="flex items-center gap-3 p-3 rounded-md bg-background"
                data-testid={`top-room-${i}`}
              >
                <span className="text-sm font-medium text-muted-foreground w-6">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {room.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    {room.clicks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No room engagement data yet
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
