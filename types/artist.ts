export interface MusicalDNA {
  genres: string[];
  subgenres: string[];
  references: string[];
  instruments: string[];
  bpm_range: { min: number; max: number };
  keys: string[];
  suno_tags: string[];
}

export interface LyricalDNA {
  writing_style: string;
  themes: string[];
  languages: string[];
  signature_words: string[];
  forbidden_themes: string[];
  literary_references: string[];
}

export interface VisualIdentity {
  color_palette: string[];
  visual_style: string;
  visual_references: string[];
  signature_prompt: string;
}

export interface Lore {
  universe_description: string;
  characters: string[];
  places: string[];
  narrative_arc: string;
}

export interface Artist {
  id: string;
  name: string;
  bio_short: string;
  bio_long: string;
  avatar: string;
  musical_dna: MusicalDNA;
  lyrical_dna: LyricalDNA;
  visual_identity: VisualIdentity;
  lore: Lore;
  created: string;
  updated: string;
}

export type ArtistCreate = Omit<Artist, "id" | "created" | "updated">;
export type ArtistUpdate = Partial<ArtistCreate>;
