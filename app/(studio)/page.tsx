import { getPocketBase } from "@/lib/pocketbase";
import Link from "next/link";
import { Music2, Users, FolderOpen, Disc3, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getPocketBaseFileUrl } from "@/lib/utils";
import type { Artist } from "@/types/artist";
import type { Project } from "@/types/project";

async function getDashboardData(): Promise<{
  artists: Artist[];
  recentProjects: Project[];
  stats: { artists: number; projects: number; tracks: number; albums: number };
}> {
  const pb = getPocketBase();
  const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";

  try {
    const [artistsList, projectsList, tracksList, albumsList] = await Promise.all([
      pb.collection("artists").getList<Artist>(1, 6, { sort: "-created" }),
      pb.collection("projects").getList<Project>(1, 5, {
        sort: "-updated",
        filter: 'status = "active"',
        expand: "artist",
      }),
      pb.collection("tracks").getList(1, 1),
      pb.collection("albums").getList(1, 1),
    ]);

    return {
      artists: artistsList.items,
      recentProjects: projectsList.items,
      stats: {
        artists: artistsList.totalItems,
        projects: projectsList.totalItems,
        tracks: tracksList.totalItems,
        albums: albumsList.totalItems,
      },
    };
  } catch {
    return {
      artists: [],
      recentProjects: [],
      stats: { artists: 0, projects: 0, tracks: 0, albums: 0 },
    };
  }
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const { artists, recentProjects, stats } = await getDashboardData();
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  const statCards = [
    { label: "Artistes", value: stats.artists, icon: Users, href: "/artists" },
    { label: "Projets actifs", value: stats.projects, icon: FolderOpen, href: "/projects" },
    { label: "Morceaux", value: stats.tracks, icon: Music2, href: "/library" },
    { label: "Albums", value: stats.albums, icon: Disc3, href: "/library" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Studio IA</h1>
          <p className="text-sm text-zinc-500">
            Votre studio de création musicale assisté par IA
          </p>
        </div>
        <Link href="/artists/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel artiste
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-zinc-800 bg-zinc-900 transition-colors hover:border-purple-600/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Artists */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base text-white">Artistes</CardTitle>
            <Link href="/artists" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {artists.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-600">Aucun artiste créé</p>
                <Link href="/artists/new">
                  <Button variant="outline" size="sm" className="mt-3 border-zinc-700 text-xs">
                    Créer un artiste
                  </Button>
                </Link>
              </div>
            ) : (
              artists.map((artist) => {
                const avatarUrl = artist.avatar
                  ? getPocketBaseFileUrl(pbUrl, "artists", artist.id, artist.avatar, "80x80")
                  : null;

                return (
                  <Link key={artist.id} href={`/artists/${artist.id}`}>
                    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-800">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-800">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-purple-600/30 text-sm font-bold text-purple-400">
                            {artist.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{artist.name}</p>
                        {artist.bio_short && (
                          <p className="truncate text-xs text-zinc-500">{artist.bio_short}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base text-white">Projets récents</CardTitle>
            <Link href="/projects" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProjects.length === 0 ? (
              <div className="py-8 text-center">
                <FolderOpen className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-600">Aucun projet actif</p>
                <Link href="/projects/new">
                  <Button variant="outline" size="sm" className="mt-3 border-zinc-700 text-xs">
                    Nouveau projet
                  </Button>
                </Link>
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}/studio`}>
                  <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-zinc-800">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{project.title}</p>
                      <p className="text-xs text-zinc-500">
                        {project.expand?.artist?.name || "Artiste inconnu"} •{" "}
                        {project.type === "track" ? "Morceau" : "Album"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Actif
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
