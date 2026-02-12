import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  FileText,
  Palette,
  Shield,
  Check,
  Plus,
  X,
} from "lucide-react";
import type { File as FileRecord } from "@shared/schema";

type Step = "basics" | "files" | "branding" | "access";

const steps: { key: Step; label: string; icon: any }[] = [
  { key: "basics", label: "Basics", icon: FolderOpen },
  { key: "files", label: "Files", icon: FileText },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "access", label: "Access", icon: Shield },
];

export default function RoomBuilder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("basics");

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");
  const [requireEmail, setRequireEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [fileTitles, setFileTitles] = useState<Record<string, string>>({});
  const [fileDescriptions, setFileDescriptions] = useState<
    Record<string, string>
  >({});
  const [fileSections, setFileSections] = useState<Record<string, string>>({});

  const { data: libraryFiles } = useQuery<FileRecord[]>({
    queryKey: ["/api/files"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/deal-rooms", {
        name,
        headline: headline || null,
        welcomeMessage: welcomeMessage || null,
        brandColor,
        requireEmail,
        password: password || null,
        allowDownload,
        assets: selectedFileIds.map((fileId, index) => ({
          fileId,
          title: fileTitles[fileId] || libraryFiles?.find((f) => f.id === fileId)?.fileName || "Untitled",
          description: fileDescriptions[fileId] || null,
          section: fileSections[fileId] || null,
          order: index,
        })),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-rooms"] });
      toast({ title: "Deal room created successfully" });
      navigate(`/rooms/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create deal room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const toggleFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const canSubmit = name.trim().length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Create Deal Room
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Set up a new content room for your prospect.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <button
            key={step.key}
            onClick={() => setCurrentStep(step.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              currentStep === step.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover-elevate"
            }`}
            data-testid={`step-${step.key}`}
          >
            <step.icon className="h-4 w-4" />
            {step.label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {currentStep === "basics" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acme Corp — Q1 Proposal"
                data-testid="input-room-name"
              />
              <p className="text-xs text-muted-foreground">
                Internal name, only visible to you and your team.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Public Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Your Custom Proposal"
                data-testid="input-headline"
              />
              <p className="text-xs text-muted-foreground">
                Shown to prospects when they open the deal room.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome">Welcome Message</Label>
              <Textarea
                id="welcome"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Thanks for taking the time to review our proposal..."
                className="resize-none"
                rows={3}
                data-testid="input-welcome"
              />
            </div>
          </div>
        )}

        {currentStep === "files" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Add Files</h3>
                <p className="text-sm text-muted-foreground">
                  Select files from your library to include in this room.
                </p>
              </div>
            </div>

            {!libraryFiles || libraryFiles.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  No files in your library yet. Upload files first.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/files")}
                  data-testid="button-go-to-files"
                >
                  Go to File Library
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {libraryFiles.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover-elevate"
                      }`}
                      onClick={() => toggleFile(file.id)}
                      data-testid={`file-select-${file.id}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          file.fileType.toUpperCase().slice(0, 4)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(1)} KB ·{" "}
                          {file.fileType}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedFileIds.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm">
                  Configure Selected Files ({selectedFileIds.length})
                </h4>
                {selectedFileIds.map((fileId) => {
                  const file = libraryFiles?.find((f) => f.id === fileId);
                  return (
                    <Card key={fileId} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {file?.fileName}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFile(fileId)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Display title"
                        value={fileTitles[fileId] || ""}
                        onChange={(e) =>
                          setFileTitles((prev) => ({
                            ...prev,
                            [fileId]: e.target.value,
                          }))
                        }
                        data-testid={`input-title-${fileId}`}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={fileDescriptions[fileId] || ""}
                        onChange={(e) =>
                          setFileDescriptions((prev) => ({
                            ...prev,
                            [fileId]: e.target.value,
                          }))
                        }
                        data-testid={`input-desc-${fileId}`}
                      />
                      <Input
                        placeholder="Section (e.g., Proposal, Case Studies)"
                        value={fileSections[fileId] || ""}
                        onChange={(e) =>
                          setFileSections((prev) => ({
                            ...prev,
                            [fileId]: e.target.value,
                          }))
                        }
                        data-testid={`input-section-${fileId}`}
                      />
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentStep === "branding" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="brandColor"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-9 w-12 rounded-md border cursor-pointer"
                  data-testid="input-brand-color"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="max-w-[120px]"
                />
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-medium text-sm mb-3">Preview</h4>
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: brandColor + "20" }}
                  >
                    <FolderOpen
                      className="h-5 w-5"
                      style={{ color: brandColor }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {headline || name || "Your Deal Room"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {welcomeMessage || "Welcome to your deal room"}
                    </p>
                  </div>
                </div>
                <div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
              </Card>
            </div>
          </div>
        )}

        {currentStep === "access" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Require Email to View</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prospects must enter their email before accessing the room.
                </p>
              </div>
              <Switch
                checked={requireEmail}
                onCheckedChange={setRequireEmail}
                data-testid="switch-require-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password Protection</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for no password"
                data-testid="input-password"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Allow Downloads</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Let prospects download files from the room.
                </p>
              </div>
              <Switch
                checked={allowDownload}
                onCheckedChange={setAllowDownload}
                data-testid="switch-allow-download"
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          data-testid="button-prev-step"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStepIndex < steps.length - 1 ? (
          <Button onClick={goNext} data-testid="button-next-step">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
            data-testid="button-create-room"
          >
            {createMutation.isPending ? "Creating..." : "Create Deal Room"}
          </Button>
        )}
      </div>
    </div>
  );
}
