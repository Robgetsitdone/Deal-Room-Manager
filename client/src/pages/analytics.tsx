import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  FolderOpen,
  BarChart3,
  Trophy,
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
  "hsl(224, 76%, 48%)",
  "hsl(142, 76%, 36%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 75%, 55%)",
];

const statCards = [
  { key: "totalRooms", label: "Active Hubs", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalViews", label: "Total Views", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "totalClicks", label: "Total Clicks", icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "viewsThisWeek", label: "This Week", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
] as const;

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto page-enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track engagement across all your deal hubs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
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
                {analytics?.[card.key] || 0}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h3 className="font-semibold text-lg">Views Over Time</h3>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : analytics?.viewsByDay && analytics.viewsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
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
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Bar
                  dataKey="views"
                  fill="hsl(224, 76%, 48%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No view data yet. Share a hub to start tracking.
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Devices</h3>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : analytics?.deviceBreakdown &&
            analytics.deviceBreakdown.length > 0 ? (
            <div className="space-y-5">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={analytics.deviceBreakdown}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {analytics.deviceBreakdown.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {analytics.deviceBreakdown.map((d, i) => (
                  <div
                    key={d.device}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="capitalize text-muted-foreground">
                        {d.device || "Unknown"}
                      </span>
                    </div>
                    <span className="font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No device data yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Top Deal Hubs */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-amber-500" />
          <h3 className="font-semibold text-lg">Top Deal Hubs</h3>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : analytics?.topRooms && analytics.topRooms.length > 0 ? (
          <div className="space-y-2">
            {analytics.topRooms.map((room, i) => (
              <div
                key={room.name}
                className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                data-testid={`top-room-${i}`}
              >
                <span className="text-sm font-bold text-muted-foreground w-7 text-center">
                  #{i + 1}
                </span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                </div>
                <div className="flex items-center gap-5 text-sm text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-medium">{room.views}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    <span className="font-medium">{room.clicks}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No engagement data yet. Publish and share a hub to see results.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
