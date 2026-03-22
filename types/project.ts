export type ProjectType = "track" | "album";
export type ProjectStatus = "active" | "archived";
export type AlbumStatus = "idea" | "in_progress" | "complete";
export type TrackStatus = "idea" | "draft" | "in_progress" | "final";

export interface Album {
  id: string;
  artist: string;
  title: string;
  concept: string;
  lore: string;
  cover: string;
  cover_prompt: string;
  status: AlbumStatus;
  release_date: string;
  created: string;
  updated: string;
  expand?: {
    artist?: import("./artist").Artist;
  };
}

export type AlbumCreate = Omit<Album, "id" | "created" | "updated" | "expand">;
export type AlbumUpdate = Partial<AlbumCreate>;

export interface TrackTags {
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  custom: string[];
}

export interface Track {
  id: string;
  artist: string;
  album: string;
  template: string;
  title: string;
  status: TrackStatus;
  concept_sheet: string;
  lore_connections: string;
  lyrics_raw: string;
  lyrics_suno: string;
  prompt_style: string;
  prompt_cover: string;
  suno_url: string;
  master_mp3: string;
  master_wav: string;
  stem_instrumental: string;
  stem_vocals: string;
  stems_other: string[];
  cover: string;
  cover_variants: string[];
  tags: TrackTags;
  created: string;
  updated: string;
  expand?: {
    artist?: import("./artist").Artist;
    album?: Album;
  };
}

export type TrackCreate = Omit<Track, "id" | "created" | "updated" | "expand">;
export type TrackUpdate = Partial<TrackCreate>;

export interface TemplateSection {
  name: string;
  duration_approx: string;
  instructions: string;
}

export interface Template {
  id: string;
  artist: string;
  name: string;
  structure: { sections: TemplateSection[] };
  style: {
    genre: string;
    subgenre: string;
    influences: string[];
    instruments: string[];
    bpm: number;
    key: string;
    suno_tags: string[];
  };
  theme: {
    emotional_register: string[];
    thematic_universe: string;
    lyrical_keywords: string[];
  };
  narrative: {
    narration_type: string;
    narrative_arc: string;
    lyrical_tone: string;
  };
  created: string;
  updated: string;
}

export type TemplateCreate = Omit<Template, "id" | "created" | "updated">;
export type TemplateUpdate = Partial<TemplateCreate>;

export interface Project {
  id: string;
  artist: string;
  type: ProjectType;
  track: string;
  album: string;
  title: string;
  status: ProjectStatus;
  created: string;
  updated: string;
  expand?: {
    artist?: import("./artist").Artist;
    track?: Track;
    album?: Album;
  };
}

export type ProjectCreate = Omit<Project, "id" | "created" | "updated" | "expand">;
export type ProjectUpdate = Partial<ProjectCreate>;
