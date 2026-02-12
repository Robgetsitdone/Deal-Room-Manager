import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Save } from "lucide-react";
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
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your organization settings.
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32" />
        </Card>
      ) : (
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Organization</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-org-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgBrandColor">Default Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="orgBrandColor"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer"
                data-testid="input-org-brand-color"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="max-w-[120px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used as the default color for new deal rooms.
            </p>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            data-testid="button-save-settings"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      )}
    </div>
  );
}
