import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Music2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPocketBaseFileUrl } from "@/lib/utils";
import type { Track } from "@/types/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  idea: "Idée",
  draft: "Brouillon",
  in_progress: "En cours",
  final: "Final",
};

export default async function TrackPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const pb = getPocketBase();
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  let track: Track;
  try {
    track = await pb.collection("tracks").getOne<Track>(id, {
      expand: "artist,album,template",
    });
  } catch {
    notFound();
  }

  const coverUrl = track.cover
    ? getPocketBaseFileUrl(pbUrl, "tracks", track.id, track.cover, "400x400")
    : null;

  const mp3Url = track.master_mp3
    ? getPocketBaseFileUrl(pbUrl, "tracks", track.id, track.master_mp3)
    : null;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/library">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">{track.title}</h1>
        <Badge variant="secondary">{STATUS_LABELS[track.status] || track.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cover + Audio */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-zinc-800">
            {coverUrl ? (
              <img src={coverUrl} alt={track.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2 className="h-16 w-16 text-zinc-600" />
              </div>
            )}
          </div>

          {mp3Url && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <p className="mb-2 text-xs text-zinc-500">Audio</p>
              <audio controls className="w-full" src={mp3Url}>
                <track kind="captions" />
              </audio>
            </div>
          )}

          {track.suno_url && (
            <a
              href={track.suno_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm text-zinc-400 transition-colors hover:border-purple-600/50 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir sur Suno
            </a>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          {/* Tags */}
          {track.tags && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {track.tags.genre && <Badge variant="secondary">{track.tags.genre}</Badge>}
                  {track.tags.mood && <Badge variant="secondary">{track.tags.mood}</Badge>}
                  {track.tags.bpm && <Badge variant="outline">{track.tags.bpm} BPM</Badge>}
                  {track.tags.key && <Badge variant="outline">{track.tags.key}</Badge>}
                  {track.tags.custom?.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Concept */}
          {track.concept_sheet && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Fiche Concept</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {track.concept_sheet}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Prompt Suno */}
          {track.prompt_style && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Prompt Suno</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800/50 rounded p-3">
                  {track.prompt_style}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Lyrics Suno */}
          {track.lyrics_suno && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Lyrics (format Suno)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {track.lyrics_suno}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Lyrics Raw */}
          {track.lyrics_raw && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Lyrics (version littéraire)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {track.lyrics_raw}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
