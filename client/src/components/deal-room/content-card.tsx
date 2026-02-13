import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FilePreview } from "./file-preview";
import { getFileTypeBadge, getFileTypeColor, formatFileSize } from "./file-type-utils";

interface ContentCardProps {
  title: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  brandColor?: string;
  isSelected?: boolean;
  onClick: () => void;
}

export function ContentCard({
  title,
  fileUrl,
  fileType,
  fileName,
  fileSize,
  brandColor,
  isSelected,
  onClick,
}: ContentCardProps) {
  const badge = getFileTypeBadge(fileType);
  const colors = getFileTypeColor(fileType);

  return (
    <Card
      className={`cursor-pointer group overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${
        isSelected ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <AspectRatio ratio={4 / 3}>
        <div className="w-full h-full overflow-hidden">
          <FilePreview
            fileUrl={fileUrl}
            fileType={fileType}
            fileName={fileName}
            brandColor={brandColor}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </AspectRatio>
      <div className="p-3.5">
        <p className="font-medium text-sm truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 font-bold ${colors.color}`}
          >
            {badge}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(fileSize)}
          </span>
        </div>
      </div>
    </Card>
  );
}
