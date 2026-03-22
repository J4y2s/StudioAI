import { getPocketBase } from "@/lib/pocketbase";
import Link from "next/link";
import { Library, Grid3X3, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrackSheet } from "@/components/library/TrackSheet";
import { AlbumSheet } from "@/components/library/AlbumSheet";
import type { Track, Album } from "@/types/project";

interface SearchParams {
  view?: "grid" | "list";
  type?: "tracks" | "albums";
  artistId?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

async function getData(artistId?: string): Promise<{ tracks: Track[]; albums: Album[] }> {
  const pb = getPocketBase();
  const filter = artistId ? `artist = "${artistId}"` : "";

  const [tracks, albums] = await Promise.all([
    pb.collection("tracks").getFullList<Track>({
      sort: "-created",
      filter,
      expand: "artist,album",
    }).catch(() => [] as Track[]),
    pb.collection("albums").getFullList<Album>({
      sort: "-created",
      filter,
      expand: "artist",
    }).catch(() => [] as Album[]),
  ]);

  return { tracks, albums };
}

export default async function LibraryPage({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const view = params.view || "list";
  const type = params.type || "tracks";
  const artistId = params.artistId;

  const { tracks, albums } = await getData(artistId);
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Bibliothèque</h1>
          <p className="text-sm text-zinc-500">
            {tracks.length} morceau{tracks.length !== 1 ? "x" : ""} · {albums.length} album{albums.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/library?type=tracks&view=${view}${artistId ? `&artistId=${artistId}` : ""}`}>
            <Badge variant={type === "tracks" ? "default" : "secondary"} className="cursor-pointer">
              Morceaux
            </Badge>
          </Link>
          <Link href={`/library?type=albums&view=${view}${artistId ? `&artistId=${artistId}` : ""}`}>
            <Badge variant={type === "albums" ? "default" : "secondary"} className="cursor-pointer">
              Albums
            </Badge>
          </Link>
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
            <Link
              href={`/library?type=${type}&view=list${artistId ? `&artistId=${artistId}` : ""}`}
              className={`p-1.5 ${view === "list" ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
            >
              <List className="h-4 w-4 text-zinc-400" />
            </Link>
            <Link
              href={`/library?type=${type}&view=grid${artistId ? `&artistId=${artistId}` : ""}`}
              className={`p-1.5 ${view === "grid" ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
            >
              <Grid3X3 className="h-4 w-4 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {type === "tracks" && (
        <>
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Library className="mb-4 h-12 w-12 text-zinc-700" />
              <p className="text-zinc-500">Aucun morceau dans la bibliothèque</p>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {tracks.map((track) => (
                <Link key={track.id} href={`/library/tracks/${track.id}`}>
                  <TrackSheet track={track} pbUrl={pbUrl} className="transition-all hover:border-purple-600/30" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {type === "albums" && (
        <>
          {albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Library className="mb-4 h-12 w-12 text-zinc-700" />
              <p className="text-zinc-500">Aucun album dans la bibliothèque</p>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {albums.map((album) => (
                <Link key={album.id} href={`/library/albums/${album.id}`}>
                  <AlbumSheet
                    album={album}
                    pbUrl={pbUrl}
                    className="transition-all hover:border-purple-600/30"
                  />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
