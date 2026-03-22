"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Artist } from "@/types/artist";

export function NewProjectForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    type: "track" as "track" | "album",
    artistId: searchParams.get("artistId") || "",
  });

  useEffect(() => {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
    fetch(`${pbUrl}/api/collections/artists/records?sort=name`)
      .then((r) => r.json())
      .then((data: { items: Artist[] }) => setArtists(data.items || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.title || !formData.artistId) {
      toast({ title: "Erreur", description: "Titre et artiste sont requis", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
      const res = await fetch(`${pbUrl}/api/collections/projects/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          artist: formData.artistId,
          status: "active",
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");
      const project = await res.json() as { id: string };

      toast({ title: "Projet créé!", description: formData.title });
      router.push(`/projects/${project.id}/studio`);
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">Nouveau projet</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-md space-y-5">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <div>
            <Label className="text-xs text-zinc-400">Titre du projet *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Neon Dreams - Single"
              className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-xs text-zinc-400">Artiste *</Label>
            <Select
              value={formData.artistId}
              onValueChange={(v) => setFormData((p) => ({ ...p, artistId: v }))}
            >
              <SelectTrigger className="mt-1.5 border-zinc-700 bg-zinc-800 text-white">
                <SelectValue placeholder="Sélectionner un artiste" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                {artists.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-white hover:bg-zinc-700">
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-zinc-400">Type de projet</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData((p) => ({ ...p, type: v as "track" | "album" }))}
            >
              <SelectTrigger className="mt-1.5 border-zinc-700 bg-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                <SelectItem value="track" className="text-white hover:bg-zinc-700">
                  🎵 Morceau
                </SelectItem>
                <SelectItem value="album" className="text-white hover:bg-zinc-700">
                  💿 Album
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/projects">
            <Button variant="outline" className="border-zinc-700 text-zinc-400">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer le projet"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
