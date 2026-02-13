import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  FileText,
  Download,
  Lock,
  Mail,
  Eye,
  ExternalLink,
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";

interface PublicRoomData {
  id: string;
  name: string;
  headline: string | null;
  welcomeMessage: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  allowDownload: boolean;
  requireEmail: boolean;
  hasPassword: boolean;
  assets: {
    id: string;
    title: string;
    description: string | null;
    section: string | null;
    order: number;
    file: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl: string;
    };
  }[];
}

interface Comment {
  id: string;
  dealRoomId: string;
  authorName: string;
  authorEmail: string | null;
  authorRole: "seller" | "prospect";
  authorUserId: string | null;
  message: string;
  createdAt: string | null;
}

export default function PublicRoom() {
  const [, params] = useRoute("/r/:token");
  const token = params?.token;

  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [viewerName, setViewerName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const durationRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [showComments, setShowComments] = useState(true);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: room, isLoading, error } = useQuery<PublicRoomData>({
    queryKey: ["/api/share", token],
    enabled: !!token,
    retry: false,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/share", token, "comments"],
    enabled: !!token && unlocked,
    refetchInterval: 15000,
  });

  const verifyMutation = useMutation({
    mutationFn: (data: { email?: string; name?: string; company?: string; password?: string }) =>
      apiRequest("POST", `/api/share/${token}/verify`, data).then((r) =>
        r.json()
      ),
    onSuccess: () => setUnlocked(true),
    onError: () => {},
  });

  const trackViewMutation = useMutation({
    mutationFn: (data: { viewerEmail?: string; viewerName?: string; viewerCompany?: string }) =>
      apiRequest("POST", `/api/share/${token}/track`, data).then((r) =>
        r.json()
      ),
    onSuccess: (data) => {
      if (data.viewId) setViewId(data.viewId);
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: (assetId: string) =>
      apiRequest("POST", `/api/share/${token}/click`, {
        assetId,
        viewId,
      }),
  });

  const postCommentMutation = useMutation({
    mutationFn: (data: { authorName: string; authorEmail?: string; message: string }) =>
      apiRequest("POST", `/api/share/${token}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/share", token, "comments"] });
      setCommentMessage("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
  });

  useEffect(() => {
    if (room && !room.requireEmail && !room.hasPassword && !unlocked) {
      setUnlocked(true);
    }
  }, [room, unlocked]);

  useEffect(() => {
    if (unlocked && token && !viewId) {
      trackViewMutation.mutate({
        viewerEmail: email || undefined,
        viewerName: viewerName || undefined,
        viewerCompany: company || undefined,
      });
      if (email) setCommentEmail(email);
      if (viewerName) setCommentName(viewerName);
    }
  }, [unlocked, token]);

  useEffect(() => {
    if (unlocked && viewId) {
      intervalRef.current = setInterval(() => {
        durationRef.current += 30;
        fetch(`/api/share/${token}/duration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewId, duration: durationRef.current }),
        }).catch(() => {});
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [unlocked, viewId, token]);

  const handleUnlock = () => {
    if (room?.hasPassword) {
      verifyMutation.mutate({
        email: email || undefined,
        name: viewerName || undefined,
        company: company || undefined,
        password,
      });
    } else {
      setUnlocked(true);
    }
  };

  const handleAssetClick = (asset: PublicRoomData["assets"][0]) => {
    if (viewId) {
      trackClickMutation.mutate(asset.id);
    }
    window.open(asset.file.fileUrl, "_blank");
  };

  const handlePostComment = () => {
    if (!commentName.trim() || !commentMessage.trim()) return;
    postCommentMutation.mutate({
      authorName: commentName.trim(),
      authorEmail: commentEmail.trim() || undefined,
      message: commentMessage.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Hub Not Available</h1>
          <p className="text-sm text-muted-foreground">
            This deal hub may have expired or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const brandColor = room.brandColor || "#2563EB";

  if (!unlocked && (room.requireEmail || room.hasPassword)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-6 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: brandColor + "20" }}
            >
              <FolderOpen className="h-5 w-5" style={{ color: brandColor }} />
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                {room.headline || room.name}
              </h1>
            </div>
          </div>

          {room.requireEmail && (
            <>
              <div className="space-y-2">
                <Label htmlFor="gate-name">Your Name</Label>
                <Input
                  id="gate-name"
                  value={viewerName}
                  onChange={(e) => setViewerName(e.target.value)}
                  placeholder="John Doe"
                  data-testid="input-gate-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gate-email">Email Address *</Label>
                <Input
                  id="gate-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  data-testid="input-gate-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gate-company">Company</Label>
                <Input
                  id="gate-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  data-testid="input-gate-company"
                />
              </div>
            </>
          )}

          {room.hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="gate-password">Password</Label>
              <Input
                id="gate-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                data-testid="input-gate-password"
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleUnlock}
            disabled={
              (room.requireEmail && !email) || verifyMutation.isPending
            }
            style={{ backgroundColor: brandColor }}
            data-testid="button-unlock"
          >
            {verifyMutation.isPending ? "Verifying..." : "Continue"}
          </Button>

          {verifyMutation.isError && (
            <p className="text-sm text-destructive text-center">
              Invalid password. Please try again.
            </p>
          )}
        </Card>
      </div>
    );
  }

  const sections = Array.from(
    new Set(room.assets.map((a) => a.section).filter(Boolean))
  ) as string[];
  const unsectioned = room.assets.filter((a) => !a.section);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="h-1.5"
        style={{ backgroundColor: brandColor }}
      />

      <div className="flex min-h-[calc(100vh-0.375rem)]">
        {/* Main Content */}
        <div className={`flex-1 transition-all ${showComments ? "mr-0" : ""}`}>
          <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: brandColor + "20" }}
              >
                <FolderOpen className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight">
                  {room.headline || room.name}
                </h1>
                {room.welcomeMessage && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {room.welcomeMessage}
                  </p>
                )}
              </div>
            </div>

            {sections.map((section) => (
              <div key={section} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {section}
                </h2>
                {room.assets
                  .filter((a) => a.section === section)
                  .sort((a, b) => a.order - b.order)
                  .map((asset) => (
                    <PublicAssetCard
                      key={asset.id}
                      asset={asset}
                      brandColor={brandColor}
                      allowDownload={room.allowDownload}
                      onClick={() => handleAssetClick(asset)}
                    />
                  ))}
              </div>
            ))}

            {unsectioned.length > 0 && (
              <div className="space-y-3">
                {sections.length > 0 && (
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Files
                  </h2>
                )}
                {unsectioned
                  .sort((a, b) => a.order - b.order)
                  .map((asset) => (
                    <PublicAssetCard
                      key={asset.id}
                      asset={asset}
                      brandColor={brandColor}
                      allowDownload={room.allowDownload}
                      onClick={() => handleAssetClick(asset)}
                    />
                  ))}
              </div>
            )}

            <div className="pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Powered by DealBuddy
              </p>
            </div>
          </div>
        </div>

        {/* Comments Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-card border border-r-0 rounded-l-md p-2 shadow-sm"
          style={{ right: showComments ? "360px" : "0px", transition: "right 0.2s" }}
          data-testid="button-toggle-comments"
        >
          {showComments ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4" />
            </div>
          )}
        </button>

        {/* Comments Panel */}
        <div
          className={`fixed right-0 top-[0.375rem] bottom-0 w-[360px] border-l bg-card flex flex-col transition-transform z-20 ${showComments ? "translate-x-0" : "translate-x-full"}`}
          data-testid="panel-comments"
        >
          <div className="p-4 border-b flex items-center gap-2">
            <MessageSquare className="h-4 w-4" style={{ color: brandColor }} />
            <h2 className="font-semibold text-sm">Comments & Notes</h2>
            {comments && comments.length > 0 && (
              <Badge variant="secondary" className="text-xs ml-auto">
                {comments.length}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(!comments || comments.length === 0) ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to leave a note.
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-1" data-testid={`public-comment-${comment.id}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${comment.authorRole === "seller" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <Badge variant={comment.authorRole === "seller" ? "default" : "secondary"} className="text-xs">
                      {comment.authorRole === "seller" ? "Team" : "Prospect"}
                    </Badge>
                  </div>
                  <p className="text-sm pl-8 whitespace-pre-wrap">{comment.message}</p>
                  <p className="text-xs text-muted-foreground pl-8">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <div className="p-4 border-t space-y-3">
            {!commentName && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name *"
                  className="text-sm"
                  data-testid="input-comment-name"
                />
                <Input
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="text-sm"
                  data-testid="input-comment-email"
                />
              </div>
            )}
            {commentName && (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {commentName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground">{commentName}</span>
                <button
                  className="text-xs text-muted-foreground underline ml-auto"
                  onClick={() => setCommentName("")}
                >
                  change
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                placeholder="Write a comment..."
                className="resize-none text-sm flex-1"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handlePostComment();
                  }
                }}
                data-testid="input-comment-message"
              />
            </div>
            <Button
              className="w-full"
              size="sm"
              onClick={handlePostComment}
              disabled={!commentName.trim() || !commentMessage.trim() || postCommentMutation.isPending}
              style={{ backgroundColor: brandColor }}
              data-testid="button-submit-comment"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {postCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicAssetCard({
  asset,
  brandColor,
  allowDownload,
  onClick,
}: {
  asset: PublicRoomData["assets"][0];
  brandColor: string;
  allowDownload: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className="p-4 hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`public-asset-${asset.id}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            backgroundColor: brandColor + "15",
            color: brandColor,
          }}
        >
          {asset.file.fileType.toUpperCase().slice(0, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{asset.title}</p>
          {asset.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {asset.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {asset.file.fileType.toUpperCase()} ·{" "}
            {(asset.file.fileSize / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="flex-shrink-0">
          {allowDownload ? (
            <Download className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );
}
