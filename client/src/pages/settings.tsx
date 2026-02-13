import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Save, Building2, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import type { Organization } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();

  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ["/api/admin/settings"],
  });

  const [name, setName] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");

  useEffect(() => {
    if (org) {
      setName(org.name);
      setBrandColor(org.brandColor || "#2563EB");
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", "/api/admin/settings", { name, brandColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Settings updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto page-enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization settings.
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </Card>
      ) : (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-semibold">Organization</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName" className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Organization Name
            </Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-org-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgBrandColor" className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              Default Brand Color
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="orgBrandColor"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer"
                data-testid="input-org-brand-color"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="max-w-[120px] font-mono text-sm"
              />
              <div
                className="h-10 flex-1 rounded-lg border"
                style={{ backgroundColor: brandColor + "15" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used as the default color for new deal hubs.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="shadow-sm"
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
