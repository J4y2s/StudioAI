"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import type { ArtistCreate } from "@/types/artist";

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}): React.ReactElement {
  const [input, setInput] = useState("");

  const addTag = (): void => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
          }}
          placeholder={placeholder}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600"
        />
        <Button type="button" onClick={addTag} variant="outline" size="sm" className="border-zinc-700 shrink-0">
          Ajouter
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="ml-1 text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewArtistPage(): React.ReactElement {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    bio_short: string;
    bio_long: string;
    musical_dna: {
      genres: string[];
      subgenres: string[];
      references: string[];
      instruments: string[];
      bpm_min: string;
      bpm_max: string;
      keys: string[];
      suno_tags: string[];
    };
    lyrical_dna: {
      writing_style: string;
      themes: string[];
      languages: string[];
      signature_words: string[];
      forbidden_themes: string[];
      literary_references: string[];
    };
    visual_identity: {
      color_palette: string[];
      visual_style: string;
      visual_references: string[];
      signature_prompt: string;
    };
    lore: {
      universe_description: string;
      characters: string[];
      places: string[];
      narrative_arc: string;
    };
  }>({
    name: "",
    bio_short: "",
    bio_long: "",
    musical_dna: {
      genres: [], subgenres: [], references: [], instruments: [],
      bpm_min: "80", bpm_max: "140", keys: [], suno_tags: [],
    },
    lyrical_dna: {
      writing_style: "", themes: [], languages: ["Français"], signature_words: [],
      forbidden_themes: [], literary_references: [],
    },
    visual_identity: {
      color_palette: [], visual_style: "", visual_references: [], signature_prompt: "",
    },
    lore: {
      universe_description: "", characters: [], places: [], narrative_arc: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

      const artistData: Omit<ArtistCreate, "avatar"> = {
        name: formData.name,
        bio_short: formData.bio_short,
        bio_long: formData.bio_long,
        musical_dna: {
          genres: formData.musical_dna.genres,
          subgenres: formData.musical_dna.subgenres,
          references: formData.musical_dna.references,
          instruments: formData.musical_dna.instruments,
          bpm_range: {
            min: parseInt(formData.musical_dna.bpm_min) || 80,
            max: parseInt(formData.musical_dna.bpm_max) || 140,
          },
          keys: formData.musical_dna.keys,
          suno_tags: formData.musical_dna.suno_tags,
        },
        lyrical_dna: {
          writing_style: formData.lyrical_dna.writing_style,
          themes: formData.lyrical_dna.themes,
          languages: formData.lyrical_dna.languages,
          signature_words: formData.lyrical_dna.signature_words,
          forbidden_themes: formData.lyrical_dna.forbidden_themes,
          literary_references: formData.lyrical_dna.literary_references,
        },
        visual_identity: {
          color_palette: formData.visual_identity.color_palette,
          visual_style: formData.visual_identity.visual_style,
          visual_references: formData.visual_identity.visual_references,
          signature_prompt: formData.visual_identity.signature_prompt,
        },
        lore: {
          universe_description: formData.lore.universe_description,
          characters: formData.lore.characters,
          places: formData.lore.places,
          narrative_arc: formData.lore.narrative_arc,
        },
      };

      const res = await fetch(`${pbUrl}/api/collections/artists/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artistData),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");

      const artist = await res.json() as { id: string };

      // Initialize default agents
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id, artistName: formData.name }),
      });

      toast({ title: "Artiste créé!", description: `${formData.name} a été créé avec ses agents IA` });
      router.push(`/artists/${artist.id}`);
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

  const updateMusicalDna = <K extends keyof typeof formData.musical_dna>(
    key: K,
    value: typeof formData.musical_dna[K]
  ): void => {
    setFormData((prev) => ({ ...prev, musical_dna: { ...prev.musical_dna, [key]: value } }));
  };

  const updateLyricalDna = <K extends keyof typeof formData.lyrical_dna>(
    key: K,
    value: typeof formData.lyrical_dna[K]
  ): void => {
    setFormData((prev) => ({ ...prev, lyrical_dna: { ...prev.lyrical_dna, [key]: value } }));
  };

  const updateVisualIdentity = <K extends keyof typeof formData.visual_identity>(
    key: K,
    value: typeof formData.visual_identity[K]
  ): void => {
    setFormData((prev) => ({
      ...prev,
      visual_identity: { ...prev.visual_identity, [key]: value },
    }));
  };

  const updateLore = <K extends keyof typeof formData.lore>(
    key: K,
    value: typeof formData.lore[K]
  ): void => {
    setFormData((prev) => ({ ...prev, lore: { ...prev.lore, [key]: value } }));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/artists">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">Nouvel artiste</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-2xl space-y-6">
        {/* Identité de base */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Identité</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400">Nom de l&apos;artiste *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Luna Noir"
                className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Biographie courte</Label>
              <Input
                value={formData.bio_short}
                onChange={(e) => setFormData((p) => ({ ...p, bio_short: e.target.value }))}
                placeholder="Phrase de présentation en 1-2 lignes"
                className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Biographie longue</Label>
              <Textarea
                value={formData.bio_long}
                onChange={(e) => setFormData((p) => ({ ...p, bio_long: e.target.value }))}
                placeholder="Histoire complète de l'artiste..."
                className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                rows={4}
              />
            </div>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {/* ADN Musical */}
          <AccordionItem value="musical-dna" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5">
            <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">
              🎵 ADN Musical
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label className="text-xs text-zinc-400">Genres musicaux</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.musical_dna.genres}
                    onChange={(v) => updateMusicalDna("genres", v)}
                    placeholder="Ex: Dark Pop, Synthwave..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Sous-genres</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.musical_dna.subgenres}
                    onChange={(v) => updateMusicalDna("subgenres", v)}
                    placeholder="Ex: Dreampop, Darkwave..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Références artistiques</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.musical_dna.references}
                    onChange={(v) => updateMusicalDna("references", v)}
                    placeholder="Ex: Lana Del Rey, The Weeknd..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Instruments</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.musical_dna.instruments}
                    onChange={(v) => updateMusicalDna("instruments", v)}
                    placeholder="Ex: Synth, Guitar, Drums..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-zinc-400">BPM min</Label>
                  <Input
                    type="number"
                    value={formData.musical_dna.bpm_min}
                    onChange={(e) => updateMusicalDna("bpm_min", e.target.value)}
                    className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                    min={60} max={200}
                  />
                </div>
                <div>
                  <Label className="text-xs text-zinc-400">BPM max</Label>
                  <Input
                    type="number"
                    value={formData.musical_dna.bpm_max}
                    onChange={(e) => updateMusicalDna("bpm_max", e.target.value)}
                    className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                    min={60} max={200}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Tags Suno</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.musical_dna.suno_tags}
                    onChange={(v) => updateMusicalDna("suno_tags", v)}
                    placeholder="Tags pour Suno AI..."
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ADN Lyrique */}
          <AccordionItem value="lyrical-dna" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5">
            <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">
              ✍️ ADN Lyrique
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label className="text-xs text-zinc-400">Style d&apos;écriture</Label>
                <Textarea
                  value={formData.lyrical_dna.writing_style}
                  onChange={(e) => updateLyricalDna("writing_style", e.target.value)}
                  placeholder="Décrivez le style d'écriture de l'artiste..."
                  className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Thèmes</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lyrical_dna.themes}
                    onChange={(v) => updateLyricalDna("themes", v)}
                    placeholder="Ex: Amour, Nostalgie, Résilience..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Langues</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lyrical_dna.languages}
                    onChange={(v) => updateLyricalDna("languages", v)}
                    placeholder="Ex: Français, Anglais..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Mots signature</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lyrical_dna.signature_words}
                    onChange={(v) => updateLyricalDna("signature_words", v)}
                    placeholder="Mots récurrents dans les lyrics..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Thèmes interdits</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lyrical_dna.forbidden_themes}
                    onChange={(v) => updateLyricalDna("forbidden_themes", v)}
                    placeholder="Thèmes à éviter absolument..."
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Identité Visuelle */}
          <AccordionItem value="visual" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5">
            <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">
              🖼️ Identité Visuelle
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label className="text-xs text-zinc-400">Style visuel</Label>
                <Input
                  value={formData.visual_identity.visual_style}
                  onChange={(e) => updateVisualIdentity("visual_style", e.target.value)}
                  placeholder="Ex: Dark cinematic, Neon noir..."
                  className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Prompt visuel signature</Label>
                <Textarea
                  value={formData.visual_identity.signature_prompt}
                  onChange={(e) => updateVisualIdentity("signature_prompt", e.target.value)}
                  placeholder="Prompt de base pour générer des visuels..."
                  className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                  rows={3}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Lore */}
          <AccordionItem value="lore" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5">
            <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">
              📖 Univers & Lore
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label className="text-xs text-zinc-400">Description de l&apos;univers</Label>
                <Textarea
                  value={formData.lore.universe_description}
                  onChange={(e) => updateLore("universe_description", e.target.value)}
                  placeholder="Décrivez l'univers narratif de l'artiste..."
                  className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Arc narratif</Label>
                <Textarea
                  value={formData.lore.narrative_arc}
                  onChange={(e) => updateLore("narrative_arc", e.target.value)}
                  placeholder="L'histoire globale qui traverse toute la discographie..."
                  className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Personnages</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lore.characters}
                    onChange={(v) => updateLore("characters", v)}
                    placeholder="Personnages récurrents..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Lieux</Label>
                <div className="mt-1.5">
                  <TagInput
                    value={formData.lore.places}
                    onChange={(v) => updateLore("places", v)}
                    placeholder="Lieux importants de l'univers..."
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-3">
          <Link href="/artists">
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
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer l&apos;artiste
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
