import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  FolderOpen,
  Plus,
  Search,
  Eye,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { DealRoom } from "@shared/schema";

const statusStyles: Record<string, { variant: string; className: string }> = {
  draft: { variant: "secondary", className: "" },
  published: { variant: "default", className: "badge-success border" },
  expired: { variant: "outline", className: "badge-warning border" },
  archived: { variant: "outline", className: "" },
};

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: rooms, isLoading } = useQuery<DealRoom[]>({
    queryKey: ["/api/deal-rooms"],
  });

  const filtered = (rooms || []).filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      (room.headline || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "draft", "published", "expired", "archived"];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Deal Hubs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and share your deal hubs.
          </p>
        </div>
        <Link href="/rooms/new">
          <Button className="shadow-sm" data-testid="button-new-room">
            <Plus className="h-4 w-4 mr-2" />
            New Hub
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-rooms"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={`capitalize text-xs ${statusFilter === s ? "shadow-sm" : ""}`}
              data-testid={`button-filter-${s}`}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-20" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No deal hubs found</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first deal hub to get started."}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/rooms/new">
              <Button className="shadow-sm" data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Deal Hub
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room) => {
            const style = statusStyles[room.status] || statusStyles.draft;
            return (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card
                  className="p-5 cursor-pointer h-full hover:shadow-md transition-all duration-200 hover:-translate-y-[1px] group"
                  data-testid={`card-room-${room.id}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor:
                            (room.brandColor || "#2563EB") + "12",
                        }}
                      >
                        <FolderOpen
                          className="h-5 w-5"
                          style={{
                            color: room.brandColor || "#2563EB",
                          }}
                        />
                      </div>
                      <Badge
                        variant={(style.variant as any) || "secondary"}
                        className={`capitalize flex-shrink-0 ${style.className}`}
                      >
                        {room.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold truncate">
                        {room.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {room.headline || "No headline set"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {room.createdAt
                          ? new Date(room.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                      {room.status === "published" && (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <ExternalLink className="h-3 w-3" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
