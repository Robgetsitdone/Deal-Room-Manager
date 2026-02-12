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
  FolderOpen,
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
  if (t.includes("image")) return FileImage;
  if (t.includes("video")) return FileVideo;
  if (t.includes("pdf")) return FileText;
  return FileIcon;
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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Library</h1>
          <p className="text-muted-foreground">Manage your evaluation materials and assets</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            data-testid="button-upload-file"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-1 min-w-[300px] gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-files"
                />
              </div>
              <div className="flex items-center gap-2 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort by {sortBy}
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

              <div className="flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={typeFilter === type ? "default" : "secondary"}
                    className="cursor-pointer capitalize"
                    onClick={() => setTypeFilter(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading file...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "h-48 rounded-lg" : "h-16 w-full rounded-lg"} />
              ))}
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No files found</h3>
              <p className="text-muted-foreground">Upload your first file to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAndSortedFiles.map((file) => {
                const Icon = fileTypeIcon(file.fileType);
                const isImage = file.fileType.toLowerCase().match(/(jpg|jpeg|png|gif|webp|svg)/);
                
                return (
                  <Card key={file.id} className="group overflow-hidden hover-elevate border-muted/50">
                    <CardContent className="p-0">
                      <div className="aspect-video relative bg-muted/30 flex items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img 
                            src={file.fileUrl} 
                            alt={file.fileName}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <Icon className="h-12 w-12 text-muted-foreground/50" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="h-8 w-8"
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
                      <div className="p-3">
                        <div className="font-medium truncate text-sm" title={file.fileName}>
                          {file.fileName}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span className="uppercase">{file.fileType}</span>
                          <span>{formatFileSize(file.fileSize || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-md divide-y overflow-hidden">
              {filteredAndSortedFiles.map((file) => {
                const Icon = fileTypeIcon(file.fileType);
                return (
                  <div key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-sm" title={file.fileName}>
                          {file.fileName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase">{file.fileType}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.fileSize || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          )}
        </div>
      </Card>
    </div>
  );
}

