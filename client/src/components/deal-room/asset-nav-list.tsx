import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { getFileTypeIcon, getFileTypeColor } from "./file-type-utils";

interface Asset {
  id: string;
  title: string;
  file: { fileType: string };
}

interface AssetNavListProps {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  brandColor?: string;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssetNavList({
  assets,
  selectedId,
  onSelect,
  brandColor,
  editable = false,
  onEdit,
  onDelete,
}: AssetNavListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="py-1">
        {assets.map((asset) => {
          const Icon = getFileTypeIcon(asset.file.fileType);
          const colors = getFileTypeColor(asset.file.fileType);
          const isActive = asset.id === selectedId;

          return (
            <div
              key={asset.id}
              className={`group flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors relative ${
                isActive
                  ? "bg-primary/5 text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => onSelect(asset.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ backgroundColor: brandColor || "hsl(var(--primary))" }}
                />
              )}

              <div className={`h-7 w-7 rounded-md ${isActive ? colors.bg : "bg-muted/50"} flex items-center justify-center shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${isActive ? colors.color : ""}`} />
              </div>

              <span className="text-sm truncate flex-1 leading-snug">
                {asset.title}
              </span>

              {editable && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(asset.id);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(asset.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
