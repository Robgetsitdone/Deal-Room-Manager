import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  MousePointerClick,
  Clock,
  FileText,
  Send,
  Archive,
  Trash2,
  GripVertical,
} from "lucide-react";
import type {
  DealRoom,
  DealRoomAsset,
  DealRoomView,
  File as FileRecord,
} from "@shared/schema";

interface RoomDetail extends DealRoom {
  assets: (DealRoomAsset & { file: FileRecord })[];
  views: DealRoomView[];
  totalClicks: number;
}

export default function RoomDetail() {
  const [, params] = useRoute("/rooms/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const roomId = params?.id;

  const { data: room, isLoading } = useQuery<RoomDetail>({
    queryKey: ["/api/deal-rooms", roomId],
    enabled: !!roomId,
  });

  const publishMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/deal-rooms/${roomId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal room published!" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", `/api/deal-rooms/${roomId}`, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal room archived" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/deal-rooms/${roomId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal room deleted" });
      navigate("/rooms");
    },
  });

  const copyShareLink = () => {
    if (room) {
      const link = `${window.location.origin}/r/${room.shareToken}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Share link copied!" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Deal room not found.</p>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/r/${room.shareToken}`;
  const sections = [...new Set((room.assets || []).map((a) => a.section).filter(Boolean))] as string[];
  const unsectioned = (room.assets || []).filter((a) => !a.section);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/rooms")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold tracking-tight">
                {room.name}
              </h1>
              <Badge
                variant={
                  room.status === "published"
                    ? "default"
                    : room.status === "draft"
                      ? "secondary"
                      : "outline"
                }
                className="capitalize"
              >
                {room.status}
              </Badge>
            </div>
            {room.headline && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {room.headline}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {room.status === "draft" && (
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              data-testid="button-publish"
            >
              <Send className="h-4 w-4 mr-2" />
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
          {room.status === "published" && (
            <>
              <Button variant="outline" onClick={copyShareLink} data-testid="button-copy-link">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <a href={shareLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" data-testid="button-preview">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </a>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            data-testid="button-archive"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to delete this deal room?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            data-testid="button-delete"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {room.status === "published" && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Share Link</p>
              <p className="text-sm font-mono truncate" data-testid="text-share-link">
                {shareLink}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={copyShareLink}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold" data-testid="text-room-views">
            {room.views?.length || 0}
          </p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold" data-testid="text-room-clicks">
            {room.totalClicks || 0}
          </p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-muted-foreground">Assets</p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold" data-testid="text-room-assets">
            {room.assets?.length || 0}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets" data-testid="tab-assets">Assets</TabsTrigger>
          <TabsTrigger value="viewers" data-testid="tab-viewers">
            Viewers ({room.views?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4 space-y-4">
          {(!room.assets || room.assets.length === 0) ? (
            <Card className="p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No assets in this room yet.
              </p>
            </Card>
          ) : (
            <>
              {sections.map((section) => (
                <div key={section} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {section}
                  </h3>
                  {room.assets
                    .filter((a) => a.section === section)
                    .sort((a, b) => a.order - b.order)
                    .map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                </div>
              ))}
              {unsectioned.length > 0 && (
                <div className="space-y-2">
                  {sections.length > 0 && (
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Other
                    </h3>
                  )}
                  {unsectioned
                    .sort((a, b) => a.order - b.order)
                    .map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="viewers" className="mt-4 space-y-3">
          {(!room.views || room.views.length === 0) ? (
            <Card className="p-8 text-center">
              <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No viewers yet. Share your room to start tracking.
              </p>
            </Card>
          ) : (
            room.views.map((view) => (
              <Card
                key={view.id}
                className="p-4"
                data-testid={`viewer-${view.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {view.viewerName || view.viewerEmail || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {view.viewerCompany && (
                          <span>{view.viewerCompany}</span>
                        )}
                        {view.device && (
                          <span className="capitalize">{view.device}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {view.viewedAt
                        ? new Date(view.viewedAt).toLocaleString()
                        : "—"}
                    </p>
                    {view.duration != null && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(view.duration / 60)}m {view.duration % 60}s
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssetCard({
  asset,
}: {
  asset: DealRoomAsset & { file: { fileName: string; fileType: string; fileSize: number } };
}) {
  return (
    <Card className="p-4" data-testid={`asset-${asset.id}`}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
          {asset.file.fileType.toUpperCase().slice(0, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{asset.title}</p>
          {asset.description && (
            <p className="text-xs text-muted-foreground truncate">
              {asset.description}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex-shrink-0">
          {(asset.file.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>
    </Card>
  );
}
