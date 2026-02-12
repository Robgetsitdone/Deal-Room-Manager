import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  FolderOpen,
  FileImage,
  FileVideo,
  File as FileIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import type { File as FileRecord } from "@shared/schema";

const fileTypeIcon = (type: string) => {
  if (type.includes("image")) return FileImage;
  if (type.includes("video")) return FileVideo;
  if (type.includes("pdf") || type.includes("doc") || type.includes("ppt"))
    return FileText;
  return FileIcon;
};

const fileTypeColor = (type: string) => {
  if (type.includes("pdf")) return "text-red-500 dark:text-red-400";
  if (type.includes("ppt") || type.includes("pptx"))
    return "text-orange-500 dark:text-orange-400";
  if (type.includes("doc") || type.includes("docx"))
    return "text-blue-500 dark:text-blue-400";
  if (type.includes("image"))
    return "text-green-500 dark:text-green-400";
  return "text-muted-foreground";
};

export default function FileLibrary() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, isLoading } = useQuery<FileRecord[]>({
    queryKey: ["/api/files"],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      const uploadResult = await new Promise<{ objectPath: string; metadata: { name: string; size: number; contentType: string } }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 80) + 10);
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", "/api/uploads/direct");
        xhr.send(formData);
      });

      setProgress(90);

      await apiRequest("POST", "/api/files", {
        fileName: uploadResult.metadata.name,
        fileUrl: uploadResult.objectPath,
        fileType: (uploadResult.metadata.contentType || "application/octet-stream").split("/").pop() || "unknown",
        fileSize: uploadResult.metadata.size,
      });

      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({ title: "File uploaded successfully" });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiRequest("DELETE", `/api/files/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({ title: "File deleted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot delete file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const fileTypes = ["all", ...Array.from(new Set((files || []).map((f) => f.fileType)))];

  const filtered = (files || []).filter((file) => {
    const matchesSearch = file.fileName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || file.fileType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            File Library
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload and manage your sales content.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            data-testid="button-upload"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      {isUploading && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-primary animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={progress} className="mt-1.5 h-1.5" />
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-files"
          />
        </div>
        {fileTypes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {fileTypes.map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className="capitalize whitespace-nowrap"
                data-testid={`button-filter-${type}`}
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-10 w-10 rounded-md mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">
            {search || typeFilter !== "all"
              ? "No files match your filters"
              : "No files uploaded yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || typeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Upload your first file to get started."}
          </p>
          {!search && typeFilter === "all" && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-first"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((file) => {
            const Icon = fileTypeIcon(file.fileType);
            const colorClass = fileTypeColor(file.fileType);
            return (
              <Card
                key={file.id}
                className="p-4 space-y-3"
                data-testid={`card-file-${file.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0"
                  >
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this file?")) {
                        deleteMutation.mutate(file.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${file.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium truncate">{file.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {file.fileType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {file.fileSize < 1024
                        ? `${file.fileSize} B`
                        : file.fileSize < 1048576
                          ? `${(file.fileSize / 1024).toFixed(1)} KB`
                          : `${(file.fileSize / 1048576).toFixed(1)} MB`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded{" "}
                  {file.createdAt
                    ? new Date(file.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
