import { getPocketBase } from "@/lib/pocketbase";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPocketBaseFileUrl } from "@/lib/utils";
import type { Artist } from "@/types/artist";

async function getArtists(): Promise<Artist[]> {
  const pb = getPocketBase();
  try {
    const result = await pb.collection("artists").getFullList<Artist>({ sort: "name" });
    return result;
  } catch {
    return [];
  }
}

export default async function ArtistsPage(): Promise<React.ReactElement> {
  const artists = await getArtists();
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Artistes</h1>
          <p className="text-sm text-zinc-500">{artists.length} artiste{artists.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/artists/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel artiste
          </Button>
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="mb-4 h-12 w-12 text-zinc-700" />
          <h2 className="mb-2 text-lg font-medium text-zinc-400">Aucun artiste</h2>
          <p className="mb-6 text-sm text-zinc-600">
            Créez votre premier artiste pour commencer à créer de la musique
          </p>
          <Link href="/artists/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Créer un artiste
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => {
            const avatarUrl = artist.avatar
              ? getPocketBaseFileUrl(pbUrl, "artists", artist.id, artist.avatar, "200x200")
              : null;

            return (
              <Link key={artist.id} href={`/artists/${artist.id}`}>
                <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/20">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-purple-600/30 text-xl font-bold text-purple-400">
                          {artist.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {artist.name}
                      </h3>
                      {artist.bio_short && (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                          {artist.bio_short}
                        </p>
                      )}
                      {artist.musical_dna?.genres && artist.musical_dna.genres.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {artist.musical_dna.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
