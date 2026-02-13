import { getFileCategory, getFileTypeIcon, getFileTypeColor, getFileTypeBadge } from "./file-type-utils";

interface FilePreviewProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  brandColor?: string;
  className?: string;
}

export function FilePreview({ fileUrl, fileType, fileName, brandColor, className = "" }: FilePreviewProps) {
  const category = getFileCategory(fileType);

  if (category === "image") {
    return (
      <img
        src={fileUrl}
        alt={fileName}
        loading="lazy"
        className={`object-cover w-full h-full ${className}`}
      />
    );
  }

  const Icon = getFileTypeIcon(fileType);
  const colors = getFileTypeColor(fileType);
  const badge = getFileTypeBadge(fileType);

  // Colored placeholder for non-image files
  const bgStyle = brandColor
    ? { backgroundColor: brandColor + "08" }
    : undefined;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2.5 ${!brandColor ? colors.bg : ""} ${className}`}
      style={bgStyle}
    >
      <div className={`h-14 w-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
        <Icon className={`h-7 w-7 ${colors.color}`} />
      </div>
      <span className={`text-xs font-bold tracking-wider ${colors.color}`}>
        {badge}
      </span>
    </div>
  );
}
