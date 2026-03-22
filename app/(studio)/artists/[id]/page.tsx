import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, FolderOpen, Music2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPocketBaseFileUrl } from "@/lib/utils";
import type { Artist } from "@/types/artist";
import type { Project, Track } from "@/types/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string): Promise<{
  artist: Artist;
  projects: Project[];
  tracks: Track[];
}> {
  const pb = getPocketBase();

  const [artist, projectsList, tracksList] = await Promise.all([
    pb.collection("artists").getOne<Artist>(id).catch(() => null),
    pb.collection("projects").getList<Project>(1, 10, {
      filter: `artist = "${id}"`,
      sort: "-updated",
    }).catch(() => ({ items: [] })),
    pb.collection("tracks").getList<Track>(1, 10, {
      filter: `artist = "${id}"`,
      sort: "-created",
    }).catch(() => ({ items: [] })),
  ]);

  if (!artist) notFound();

  return { artist, projects: projectsList.items, tracks: tracksList.items };
}

export default async function ArtistPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { artist, projects, tracks } = await getData(id);
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  const avatarUrl = artist.avatar
    ? getPocketBaseFileUrl(pbUrl, "artists", artist.id, artist.avatar, "400x400")
    : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/artists">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-zinc-800">
            {avatarUrl ? (
              <img src={avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-600/30 text-xl font-bold text-purple-400">
                {artist.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{artist.name}</h1>
            {artist.bio_short && (
              <p className="text-sm text-zinc-500">{artist.bio_short}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents?artistId=${artist.id}`}>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white">
              Agents IA
            </Button>
          </Link>
          <Link href={`/artists/${artist.id}/edit`}>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ADN Musical */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">ADN Musical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artist.musical_dna?.genres && artist.musical_dna.genres.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-zinc-600">Genres</p>
                <div className="flex flex-wrap gap-1">
                  {artist.musical_dna.genres.map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                </div>
              </div>
            )}
            {artist.musical_dna?.instruments && artist.musical_dna.instruments.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-zinc-600">Instruments</p>
                <p className="text-xs text-zinc-400">{artist.musical_dna.instruments.join(", ")}</p>
              </div>
            )}
            {artist.musical_dna?.bpm_range && (
              <div>
                <p className="mb-1 text-xs text-zinc-600">BPM</p>
                <p className="text-xs text-zinc-400">
                  {artist.musical_dna.bpm_range.min} — {artist.musical_dna.bpm_range.max}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Univers & Lore */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Univers & Lore</CardTitle>
          </CardHeader>
          <CardContent>
            {artist.lore?.universe_description ? (
              <p className="text-xs text-zinc-400 leading-relaxed">
                {artist.lore.universe_description.slice(0, 200)}
                {artist.lore.universe_description.length > 200 ? "..." : ""}
              </p>
            ) : (
              <p className="text-xs text-zinc-600">Aucun lore défini</p>
            )}
          </CardContent>
        </Card>

        {/* Identité Visuelle */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Identité Visuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artist.visual_identity?.color_palette && artist.visual_identity.color_palette.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-zinc-600">Palette de couleurs</p>
                <div className="flex gap-2">
                  {artist.visual_identity.color_palette.slice(0, 6).map((color) => (
                    <div
                      key={color}
                      className="h-6 w-6 rounded-full border border-zinc-700"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {artist.visual_identity?.visual_style && (
              <div>
                <p className="mb-1 text-xs text-zinc-600">Style</p>
                <p className="text-xs text-zinc-400">{artist.visual_identity.visual_style}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects & Tracks */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Projets récents</h2>
            <Link href={`/projects/new?artistId=${artist.id}`}>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-purple-400 hover:text-purple-300">
                <Plus className="h-3 w-3" />
                Nouveau
              </Button>
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center">
              <FolderOpen className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-600">Aucun projet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}/studio`}>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-purple-600/30">
                    <p className="text-sm text-white">{project.title}</p>
                    <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                      {project.status === "active" ? "Actif" : "Archivé"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Morceaux récents</h2>
            <Link href={`/library?artistId=${artist.id}`}>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-400 hover:text-purple-300">
                Voir tout
              </Button>
            </Link>
          </div>
          {tracks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center">
              <Music2 className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-xs text-zinc-600">Aucun morceau</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <Link key={track.id} href={`/library/tracks/${track.id}`}>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-purple-600/30">
                    <p className="text-sm text-white">{track.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {track.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
