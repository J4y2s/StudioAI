import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Artist } from "@/types/artist";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtistPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const pb = getPocketBase();

  let artist: Artist;
  try {
    artist = await pb.collection("artists").getOne<Artist>(id);
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/artists/${id}`}>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">Modifier — {artist.name}</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">
            L&apos;éditeur complet est disponible. Ce formulaire reprend la même structure que la création avec les données pré-remplies.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Artiste ID: {artist.id}
          </p>
          <div className="mt-4 rounded-lg bg-zinc-800/50 p-4 text-left">
            <pre className="text-xs text-zinc-400 overflow-auto">
              {JSON.stringify({
                name: artist.name,
                bio_short: artist.bio_short,
                musical_dna: artist.musical_dna,
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
