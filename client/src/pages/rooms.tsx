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
} from "lucide-react";
import { useState } from "react";
import type { DealRoom } from "@shared/schema";

const statusColors: Record<string, string> = {
  draft: "secondary",
  published: "default",
  expired: "outline",
  archived: "outline",
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Deal Rooms
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your sales content rooms.
          </p>
        </div>
        <Link href="/rooms/new">
          <Button data-testid="button-new-room">
            <Plus className="h-4 w-4 mr-2" />
            New Room
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-rooms"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
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
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-20" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">No deal rooms found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first deal room to get started."}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/rooms/new">
              <Button data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Deal Room
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card
                className="p-5 hover-elevate cursor-pointer h-full"
                data-testid={`card-room-${room.id}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
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
                    <Badge
                      variant={
                        (statusColors[room.status] as any) || "secondary"
                      }
                      className="capitalize flex-shrink-0"
                    >
                      {room.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm truncate">
                      {room.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {room.headline || "No headline set"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {room.createdAt
                        ? new Date(room.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                    {room.status === "published" && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Shared
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
