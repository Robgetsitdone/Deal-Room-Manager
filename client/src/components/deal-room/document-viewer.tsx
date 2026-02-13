import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, ArrowLeft } from "lucide-react";
import { getFileCategory, getFileTypeIcon, getFileTypeColor, getFileTypeBadge, formatFileSize } from "./file-type-utils";

interface DocumentViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  title: string;
  allowDownload?: boolean;
  brandColor?: string;
  onBack?: () => void;
}

export function DocumentViewer({
  fileUrl,
  fileType,
  fileName,
  fileSize,
  title,
  allowDownload = true,
  brandColor,
  onBack,
}: DocumentViewerProps) {
  const category = getFileCategory(fileType);
  const badge = getFileTypeBadge(fileType);
  const colors = getFileTypeColor(fileType);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 h-12 border-b bg-card shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <p className="text-sm font-medium truncate">{title}</p>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-bold shrink-0 ${colors.color}`}>
            {badge}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {allowDownload && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Viewer body */}
      <div className="flex-1 overflow-auto bg-muted/30">
        {category === "image" && (
          <div className="flex items-center justify-center p-6 min-h-full">
            <img
              src={fileUrl}
              alt={title}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-sm"
            />
          </div>
        )}

        {category === "pdf" && (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={title}
          />
        )}

        {category === "video" && (
          <div className="flex items-center justify-center p-6 min-h-full">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-sm"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {category !== "image" && category !== "pdf" && category !== "video" && (
          <NonPreviewablePlaceholder
            fileUrl={fileUrl}
            fileType={fileType}
            fileName={fileName}
            fileSize={fileSize}
            allowDownload={allowDownload}
          />
        )}
      </div>
    </div>
  );
}

function NonPreviewablePlaceholder({
  fileUrl,
  fileType,
  fileName,
  fileSize,
  allowDownload,
}: {
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  allowDownload: boolean;
}) {
  const Icon = getFileTypeIcon(fileType);
  const colors = getFileTypeColor(fileType);
  const badge = getFileTypeBadge(fileType);

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="text-center space-y-5 max-w-sm">
        <div className={`h-20 w-20 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto`}>
          <Icon className={`h-10 w-10 ${colors.color}`} />
        </div>
        <div>
          <p className="font-semibold text-lg">{fileName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {badge} · {formatFileSize(fileSize)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          This file type can't be previewed inline.
        </p>
        <div className="flex items-center justify-center gap-2">
          {allowDownload && (
            <Button asChild>
              <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
