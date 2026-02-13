import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  FileImage,
  FileVideo,
  File as FileIcon,
  LayoutGrid,
  List,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import type { File as FileRecord } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fileTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("image") || t.match(/(jpg|jpeg|png|gif|webp|svg)/)) return FileImage;
  if (t.includes("video")) return FileVideo;
  if (t.includes("pdf")) return FileText;
  return FileIcon;
};

const fileTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return { color: "text-red-500", bg: "bg-red-500/10" };
  if (t.includes("image") || t.match(/(jpg|jpeg|png|gif|webp|svg)/)) return { color: "text-purple-500", bg: "bg-purple-500/10" };
  if (t.includes("video")) return { color: "text-blue-500", bg: "bg-blue-500/10" };
  if (t.match(/(ppt|pptx)/)) return { color: "text-amber-500", bg: "bg-amber-500/10" };
  if (t.match(/(doc|docx)/)) return { color: "text-blue-600", bg: "bg-blue-600/10" };
  if (t.match(/(xls|xlsx|csv)/)) return { color: "text-emerald-500", bg: "bg-emerald-500/10" };
  return { color: "text-muted-foreground", bg: "bg-muted" };
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function FileLibrary() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
          if (xhr.status === 401) {
            reject(new Error("Session expired. Please refresh the page and log in again."));
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else {
            let msg = "Upload failed";
            try { msg = JSON.parse(xhr.responseText)?.error || msg; } catch {}
            reject(new Error(msg));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload. Please check your connection.")));
        xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));
        xhr.timeout = 120000;
        xhr.addEventListener("timeout", () => reject(new Error("Upload timed out. Try a smaller file or check your connection.")));
        xhr.open("POST", "/api/uploads/direct");
        xhr.withCredentials = true;
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

  const filteredAndSortedFiles = useMemo(() => {
    if (!files) return [];

    let result = files.filter((file) => {
      const matchesSearch = file.fileName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || file.fileType === typeFilter;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.fileName.localeCompare(b.fileName);
      } else if (sortBy === "date") {
        comparison = Number(a.id) - Number(b.id);
      } else if (sortBy === "size") {
        comparison = Number(a.fileSize) - Number(b.fileSize);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [files, search, typeFilter, sortBy, sortOrder]);

  const fileTypes = ["all", ...Array.from(new Set((files || []).map((f) => f.fileType)))];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            File Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your evaluation materials and assets.
          </p>
        </div>
        <div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="shadow-sm"
            data-testid="button-upload-file"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-files"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${viewMode === "grid" ? "shadow-sm" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${viewMode === "list" ? "shadow-sm" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
              Sort: {sortBy}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date")}>Date Added</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("size")}>Size</DropdownMenuItem>
            <DropdownMenuItem
              className="border-t mt-1"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              Order: {sortOrder === "asc" ? "Ascending" : "Descending"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
          {fileTypes.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className={`capitalize text-xs ${typeFilter === type ? "shadow-sm" : ""}`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Uploading file...</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>
      )}

      {/* File Content */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "h-52 rounded-xl" : "h-16 w-full rounded-xl"} />
          ))}
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No files found</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            {search || typeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Upload your first file to get started."}
          </p>
          {!search && typeFilter === "all" && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedFiles.map((file) => {
            const Icon = fileTypeIcon(file.fileType);
            const colors = fileTypeColor(file.fileType);
            const isImage = file.fileType.toLowerCase().match(/(jpg|jpeg|png|gif|webp|svg)/);

            return (
              <Card key={file.id} className="group overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-[1px]">
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted/30 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`h-14 w-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`h-7 w-7 ${colors.color}`} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-9 w-9 shadow-sm" asChild>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9 shadow-sm"
                        onClick={() => {
                          if (confirm("Delete this file?")) {
                            deleteMutation.mutate(file.id.toString());
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="font-medium truncate text-sm" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase font-medium">
                        {file.fileType}
                      </Badge>
                      <span>{formatFileSize(file.fileSize || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {filteredAndSortedFiles.map((file) => {
              const Icon = fileTypeIcon(file.fileType);
              const colors = fileTypeColor(file.fileType);
              return (
                <div key={file.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${colors.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="uppercase font-medium">{file.fileType}</span>
                        <span className="text-border">|</span>
                        <span>{formatFileSize(file.fileSize || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this file?")) {
                          deleteMutation.mutate(file.id.toString());
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
