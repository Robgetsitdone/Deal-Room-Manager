import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  FileText,
  Download,
  Lock,
  Mail,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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

  const { data: room, isLoading, error } = useQuery<PublicRoomData>({
    queryKey: ["/api/share", token],
    enabled: !!token,
    retry: false,
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
    window.open(asset.file.fileUrl.startsWith("/objects/") ? asset.file.fileUrl : asset.file.fileUrl, "_blank");
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

  const sections = [
    ...new Set(room.assets.map((a) => a.section).filter(Boolean)),
  ] as string[];
  const unsectioned = room.assets.filter((a) => !a.section);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="h-1.5"
        style={{ backgroundColor: brandColor }}
      />

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
            Powered by Deal Hub
          </p>
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
