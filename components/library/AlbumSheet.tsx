"use client";

import React from "react";
import { Disc3, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, getPocketBaseFileUrl } from "@/lib/utils";
import type { Album } from "@/types/project";

const STATUS_LABELS: Record<string, string> = {
  idea: "Idée",
  in_progress: "En cours",
  complete: "Terminé",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "warning" | "success"> = {
  idea: "secondary",
  in_progress: "warning",
  complete: "success",
};

interface AlbumSheetProps {
  album: Album;
  pbUrl: string;
  trackCount?: number;
  className?: string;
}

export function AlbumSheet({ album, pbUrl, trackCount, className }: AlbumSheetProps): React.ReactElement {
  const coverUrl = album.cover
    ? getPocketBaseFileUrl(pbUrl, "albums", album.id, album.cover, "200x200")
    : null;

  return (
    <div className={cn("flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4", className)}>
      {/* Cover */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        {coverUrl ? (
          <img src={coverUrl} alt={album.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Disc3 className="h-8 w-8 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-white">{album.title}</h3>
          <Badge
            variant={STATUS_VARIANTS[album.status] || "secondary"}
            className="shrink-0 text-xs"
          >
            {STATUS_LABELS[album.status] || album.status}
          </Badge>
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          {trackCount !== undefined && (
            <span>{trackCount} morceau{trackCount !== 1 ? "x" : ""}</span>
          )}
          {album.release_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(album.release_date)}
            </span>
          )}
        </div>

        {album.concept && (
          <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{album.concept}</p>
        )}
      </div>
    </div>
  );
}
