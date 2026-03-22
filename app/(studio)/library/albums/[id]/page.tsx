import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackSheet } from "@/components/library/TrackSheet";
import { getPocketBaseFileUrl } from "@/lib/utils";
import type { Album, Track } from "@/types/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const pb = getPocketBase();
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  let album: Album;
  let tracks: Track[];

  try {
    [album, tracks] = await Promise.all([
      pb.collection("albums").getOne<Album>(id, { expand: "artist" }),
      pb.collection("tracks").getFullList<Track>({
        filter: `album = "${id}"`,
        sort: "created",
      }),
    ]);
  } catch {
    notFound();
  }

  const coverUrl = album.cover
    ? getPocketBaseFileUrl(pbUrl, "albums", album.id, album.cover, "400x400")
    : null;

  const STATUS_LABELS: Record<string, string> = {
    idea: "Idée", in_progress: "En cours", complete: "Terminé",
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/library?type=albums">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">{album.title}</h1>
        <Badge variant="secondary">{STATUS_LABELS[album.status] || album.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-zinc-800">
            {coverUrl ? (
              <img src={coverUrl} alt={album.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc3 className="h-16 w-16 text-zinc-600" />
              </div>
            )}
          </div>

          {album.expand?.artist && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-4">
                <p className="text-xs text-zinc-500">Artiste</p>
                <p className="text-sm text-white">{(album.expand.artist as { name: string }).name}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          {album.concept && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Concept</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 leading-relaxed">{album.concept}</p>
              </CardContent>
            </Card>
          )}

          {album.lore && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-zinc-500">Lore</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 leading-relaxed">{album.lore}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">
              Morceaux ({tracks.length})
            </h2>
            {tracks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center">
                <p className="text-xs text-zinc-600">Aucun morceau dans cet album</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <Link key={track.id} href={`/library/tracks/${track.id}`}>
                    <TrackSheet
                      track={track}
                      pbUrl={pbUrl}
                      className="transition-all hover:border-purple-600/30"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
