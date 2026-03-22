"use client";

import React, { useState } from "react";
import { Music, ExternalLink, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Track } from "@/types/project";
import { getPocketBaseFileUrl } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  idea: "Idée",
  draft: "Brouillon",
  in_progress: "En cours",
  final: "Final",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "warning" | "success"> = {
  idea: "secondary",
  draft: "warning",
  in_progress: "default",
  final: "success",
};

interface TrackSheetProps {
  track: Track;
  pbUrl: string;
  className?: string;
}

export function TrackSheet({ track, pbUrl, className }: TrackSheetProps): React.ReactElement {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState<React.MutableRefObject<HTMLAudioElement | null>>({ current: null });

  const coverUrl = track.cover
    ? getPocketBaseFileUrl(pbUrl, "tracks", track.id, track.cover, "200x200")
    : null;

  const mp3Url = track.master_mp3
    ? getPocketBaseFileUrl(pbUrl, "tracks", track.id, track.master_mp3)
    : null;

  const togglePlay = (): void => {
    if (!audioRef.current) {
      if (!mp3Url) return;
      audioRef.current = new Audio(mp3Url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4", className)}>
      {/* Cover */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        {coverUrl ? (
          <img src={coverUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-8 w-8 text-zinc-600" />
          </div>
        )}
        {mp3Url && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-white">{track.title}</h3>
          <Badge variant={STATUS_VARIANTS[track.status] || "secondary"} className="shrink-0 text-xs">
            {STATUS_LABELS[track.status] || track.status}
          </Badge>
        </div>

        {track.tags && (
          <div className="mt-1 flex flex-wrap gap-1">
            {track.tags.genre && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {track.tags.genre}
              </span>
            )}
            {track.tags.mood && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {track.tags.mood}
              </span>
            )}
            {track.tags.bpm && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {track.tags.bpm} BPM
              </span>
            )}
          </div>
        )}

        {track.concept_sheet && (
          <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{track.concept_sheet}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {track.suno_url && (
            <a
              href={track.suno_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="h-3 w-3" />
              Suno
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
