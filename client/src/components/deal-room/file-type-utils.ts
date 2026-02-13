import {
  FileText,
  FileImage,
  FileVideo,
  File as FileIcon,
  Presentation,
  Sheet,
  type LucideIcon,
} from "lucide-react";

export type FileCategory =
  | "image"
  | "pdf"
  | "presentation"
  | "document"
  | "spreadsheet"
  | "video"
  | "other";

export function getFileCategory(fileType: string): FileCategory {
  const t = fileType.toLowerCase();
  if (t.match(/^(jpg|jpeg|png|gif|webp|svg|bmp|ico|image)$/)) return "image";
  if (t === "pdf") return "pdf";
  if (t.match(/^(ppt|pptx|gslide)$/)) return "presentation";
  if (t.match(/^(doc|docx|txt|md|rtf|gdoc)$/)) return "document";
  if (t.match(/^(xls|xlsx|csv|gsheet)$/)) return "spreadsheet";
  if (t.match(/^(mp4|webm|mov|avi|mkv)$/)) return "video";
  return "other";
}

export function isPreviewable(fileType: string): boolean {
  const cat = getFileCategory(fileType);
  return cat === "image" || cat === "pdf" || cat === "video";
}

export function getFileTypeIcon(fileType: string): LucideIcon {
  const cat = getFileCategory(fileType);
  switch (cat) {
    case "image":
      return FileImage;
    case "pdf":
      return FileText;
    case "presentation":
      return Presentation;
    case "document":
      return FileText;
    case "spreadsheet":
      return Sheet;
    case "video":
      return FileVideo;
    default:
      return FileIcon;
  }
}

export function getFileTypeColor(fileType: string): { color: string; bg: string } {
  const cat = getFileCategory(fileType);
  switch (cat) {
    case "pdf":
      return { color: "text-red-500", bg: "bg-red-500/10" };
    case "image":
      return { color: "text-purple-500", bg: "bg-purple-500/10" };
    case "presentation":
      return { color: "text-amber-500", bg: "bg-amber-500/10" };
    case "document":
      return { color: "text-blue-600", bg: "bg-blue-600/10" };
    case "spreadsheet":
      return { color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "video":
      return { color: "text-blue-500", bg: "bg-blue-500/10" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted" };
  }
}

export function getFileTypeBadge(fileType: string): string {
  return fileType.toUpperCase().slice(0, 5);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
