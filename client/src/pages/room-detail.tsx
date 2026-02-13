import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Link as LinkIcon,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import type {
  DealRoom,
  DealRoomAsset,
  DealRoomView,
  DealRoomComment,
  File as FileRecord,
} from "@shared/schema";
import { useState } from "react";

interface RoomDetailData extends DealRoom {
  assets: (DealRoomAsset & { file: FileRecord })[];
  views: DealRoomView[];
  totalClicks: number;
}

const statusStyles: Record<string, { variant: string; className: string }> = {
  draft: { variant: "secondary", className: "" },
  published: { variant: "default", className: "badge-success border" },
  expired: { variant: "outline", className: "badge-warning border" },
  archived: { variant: "outline", className: "" },
};

export default function RoomDetail() {
  const [, params] = useRoute("/rooms/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const roomId = params?.id;

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    headline: "",
    welcomeMessage: "",
    brandColor: "",
    requireEmail: false,
    password: "",
    allowDownload: true,
  });
  const [newComment, setNewComment] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { data: room, isLoading } = useQuery<RoomDetailData>({
    queryKey: ["/api/deal-rooms", roomId],
    enabled: !!roomId,
  });

  const { data: comments } = useQuery<DealRoomComment[]>({
    queryKey: ["/api/deal-rooms", roomId, "comments"],
    enabled: !!roomId,
  });

  const { data: libraryFiles } = useQuery<FileRecord[]>({
    queryKey: ["/api/files"],
  });

  const publishMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/deal-rooms/${roomId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal hub published!" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", `/api/deal-rooms/${roomId}`, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal hub archived" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/deal-rooms/${roomId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal hub deleted" });
      navigate("/rooms");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      apiRequest("PUT", `/api/deal-rooms/${roomId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      toast({ title: "Settings updated" });
      setEditingSettings(false);
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ assetId, data }: { assetId: string; data: Record<string, any> }) =>
      apiRequest("PUT", `/api/deal-rooms/${roomId}/assets/${assetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      setEditingAssetId(null);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: string) =>
      apiRequest("DELETE", `/api/deal-rooms/${roomId}/assets/${assetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      toast({ title: "Asset removed" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiRequest("PUT", `/api/deal-rooms/${roomId}/assets/reorder`, { orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
    },
  });

  const addAssetMutation = useMutation({
    mutationFn: (data: { fileId: string; title: string; order: number }) =>
      apiRequest("POST", `/api/deal-rooms/${roomId}/assets`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId] });
      toast({ title: "File added to hub" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest("POST", `/api/deal-rooms/${roomId}/comments`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms", roomId, "comments"] });
      setNewComment("");
    },
  });

  const copyShareLink = () => {
    if (room) {
      const link = `${window.location.origin}/r/${room.shareToken}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Share link copied!" });
    }
  };

  const startEditingSettings = () => {
    if (room) {
      setSettingsForm({
        name: room.name,
        headline: room.headline || "",
        welcomeMessage: room.welcomeMessage || "",
        brandColor: room.brandColor || "#2563EB",
        requireEmail: room.requireEmail,
        password: room.password || "",
        allowDownload: room.allowDownload,
      });
      setEditingSettings(true);
    }
  };

  const startEditingAsset = (asset: DealRoomAsset) => {
    setEditingAssetId(asset.id);
    setEditTitle(asset.title);
    setEditDescription(asset.description || "");
    setEditSection(asset.section || "");
  };

  const saveAssetEdit = () => {
    if (editingAssetId) {
      updateAssetMutation.mutate({
        assetId: editingAssetId,
        data: {
          title: editTitle,
          description: editDescription || null,
          section: editSection || null,
        },
      });
    }
  };

  const sortedAssets = room?.assets
    ? [...room.assets].sort((a, b) => a.order - b.order)
    : [];

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sortedAssets];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, moved);

    reorderMutation.mutate(newOrder.map((a) => a.id));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveAsset = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedAssets.length) return;

    const newOrder = [...sortedAssets];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderMutation.mutate(newOrder.map((a) => a.id));
  };

  const existingFileIds = new Set(sortedAssets.map((a) => a.fileId));
  const availableFiles = (libraryFiles || []).filter(
    (f) => !existingFileIds.has(f.id)
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto page-enter">
        <Card className="p-12 text-center border-dashed">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Deal hub not found</h3>
          <p className="text-sm text-muted-foreground mb-5">
            This hub may have been deleted or doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate("/rooms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hubs
          </Button>
        </Card>
      </div>
    );
  }

  const style = statusStyles[room.status] || statusStyles.draft;
  const shareLink = `${window.location.origin}/r/${room.shareToken}`;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("/rooms")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {room.name}
              </h1>
              <Badge
                variant={(style.variant as any) || "secondary"}
                className={`capitalize ${style.className}`}
                data-testid="badge-status"
              >
                {room.status}
              </Badge>
            </div>
            {room.headline && (
              <p className="text-muted-foreground mt-0.5">
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
              className="shadow-sm"
              data-testid="button-publish"
            >
              <Send className="h-4 w-4 mr-2" />
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
          {room.status === "published" && (
            <Button variant="outline" onClick={copyShareLink} data-testid="button-copy-link">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          )}
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" data-testid="button-preview">
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={startEditingSettings}
            data-testid="button-edit-settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            data-testid="button-archive"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this deal hub?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            data-testid="button-delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Share Link Card */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <LinkIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Share Link</p>
            <p className="text-sm font-mono truncate" data-testid="text-share-link">
              {shareLink}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={copyShareLink} data-testid="button-copy-share">
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy
          </Button>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" data-testid="button-open-preview">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open
            </Button>
          </a>
        </div>
        {room.status === "draft" && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2.5 ml-12">
            This hub is still in draft. Publish it to make the share link active for your prospects.
          </p>
        )}
      </Card>

      {/* Settings Editor */}
      {editingSettings && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-lg">Edit Hub Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditingSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hub Name</Label>
              <Input
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Headline</Label>
              <Input
                value={settingsForm.headline}
                onChange={(e) => setSettingsForm({ ...settingsForm, headline: e.target.value })}
                data-testid="input-edit-headline"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Textarea
              value={settingsForm.welcomeMessage}
              onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
              className="resize-none"
              rows={2}
              data-testid="input-edit-welcome"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.brandColor}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandColor: e.target.value })}
                  className="h-10 w-14 rounded-lg border cursor-pointer"
                  data-testid="input-edit-color"
                />
                <Input
                  value={settingsForm.brandColor}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandColor: e.target.value })}
                  className="max-w-[120px] font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password Protection</Label>
              <Input
                type="password"
                value={settingsForm.password}
                onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                placeholder="Leave blank for no password"
                data-testid="input-edit-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
            <div>
              <Label className="text-sm font-medium">Require Email to View</Label>
              <p className="text-xs text-muted-foreground">Prospects must enter their email first.</p>
            </div>
            <Switch
              checked={settingsForm.requireEmail}
              onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, requireEmail: checked })}
              data-testid="switch-edit-email"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
            <div>
              <Label className="text-sm font-medium">Allow Downloads</Label>
              <p className="text-xs text-muted-foreground">Prospects can download files.</p>
            </div>
            <Switch
              checked={settingsForm.allowDownload}
              onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allowDownload: checked })}
              data-testid="switch-edit-download"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingSettings(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateSettingsMutation.mutate(settingsForm)}
              disabled={updateSettingsMutation.isPending}
              className="shadow-sm"
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: "views", label: "Total Views", value: room.views?.length || 0, icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
          { key: "clicks", label: "Total Clicks", value: room.totalClicks || 0, icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { key: "assets", label: "Assets", value: room.assets?.length || 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((stat) => (
          <div key={stat.key} className="stat-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2 tracking-tight" data-testid={`text-room-${stat.key}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets" data-testid="tab-assets">
            Assets ({sortedAssets.length})
          </TabsTrigger>
          <TabsTrigger value="comments" data-testid="tab-comments">
            Comments ({comments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="viewers" data-testid="tab-viewers">
            Viewers ({room.views?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4 space-y-4">
          {sortedAssets.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">No assets yet</h3>
              <p className="text-sm text-muted-foreground">
                Add files from your library to this hub.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`transition-opacity ${draggedIndex === index ? "opacity-40" : ""} ${dragOverIndex === index && draggedIndex !== index ? "border-t-2 border-primary" : ""}`}
                >
                  {editingAssetId === asset.id ? (
                    <Card className="p-5 space-y-3" data-testid={`asset-edit-${asset.id}`}>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          data-testid="input-asset-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Optional description"
                          data-testid="input-asset-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Input
                          value={editSection}
                          onChange={(e) => setEditSection(e.target.value)}
                          placeholder="Optional section grouping"
                          data-testid="input-asset-section"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAssetId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="shadow-sm"
                          onClick={saveAssetEdit}
                          disabled={updateAssetMutation.isPending}
                          data-testid="button-save-asset"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-4 hover:shadow-sm transition-shadow" data-testid={`asset-${asset.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab active:cursor-grabbing flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{
                            backgroundColor: (room.brandColor || "#2563EB") + "12",
                            color: room.brandColor || "#2563EB",
                          }}
                        >
                          {asset.file.fileType.toUpperCase().slice(0, 4)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{asset.title}</p>
                          {asset.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {asset.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            {asset.section && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {asset.section}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {(asset.file.fileSize / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveAsset(index, "up")}
                            disabled={index === 0}
                            data-testid={`button-move-up-${asset.id}`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveAsset(index, "down")}
                            disabled={index === sortedAssets.length - 1}
                            data-testid={`button-move-down-${asset.id}`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEditingAsset(asset)}
                            data-testid={`button-edit-asset-${asset.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteAssetMutation.mutate(asset.id)}
                            data-testid={`button-delete-asset-${asset.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add files from library */}
          {availableFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">Add files from library</p>
              <div className="grid gap-2">
                {availableFiles.slice(0, 5).map((file) => (
                  <Card
                    key={file.id}
                    className="p-3.5 cursor-pointer hover:shadow-sm hover:bg-muted/30 transition-all"
                    onClick={() =>
                      addAssetMutation.mutate({
                        fileId: file.id,
                        title: file.fileName,
                        order: sortedAssets.length,
                      })
                    }
                    data-testid={`add-file-${file.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Plus className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                        {file.fileType.toUpperCase().slice(0, 4)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {availableFiles.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    + {availableFiles.length - 5} more files in library
                  </p>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-4 space-y-4">
          <Card className="p-5 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a note for your prospect..."
              className="resize-none"
              rows={3}
              data-testid="input-seller-comment"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                className="shadow-sm"
                onClick={() => {
                  if (newComment.trim()) commentMutation.mutate(newComment.trim());
                }}
                disabled={!newComment.trim() || commentMutation.isPending}
                data-testid="button-post-comment"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Post Note
              </Button>
            </div>
          </Card>

          {(!comments || comments.length === 0) ? (
            <Card className="p-10 text-center border-dashed">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No comments yet. Post a note for your prospect or they can leave comments on the share page.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4" data-testid={`comment-${comment.id}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${comment.authorRole === "seller" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{comment.authorName}</span>
                        <Badge variant={comment.authorRole === "seller" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {comment.authorRole === "seller" ? "Team" : "Prospect"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-sm mt-1.5 whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewers" className="mt-4 space-y-2">
          {(!room.views || room.views.length === 0) ? (
            <Card className="p-10 text-center border-dashed">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No viewers yet. Share your hub to start tracking.
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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {view.viewerName || view.viewerEmail || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {view.viewerCompany && (
                          <span>{view.viewerCompany}</span>
                        )}
                        {view.device && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                            {view.device}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {view.viewedAt
                        ? new Date(view.viewedAt).toLocaleString()
                        : ""}
                    </p>
                    {view.duration != null && (
                      <p className="text-xs text-muted-foreground mt-0.5">
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
