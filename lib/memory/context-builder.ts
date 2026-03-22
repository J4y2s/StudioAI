import type { AgentType, Agent } from "@/types/agent";
import type { Artist } from "@/types/artist";
import type { Track, Album, Template } from "@/types/project";
import { getPocketBase } from "@/lib/pocketbase";
import { interpolateSystemPrompt } from "@/lib/agents/base-agent";

interface ContextBuilderOptions {
  agentType: AgentType;
  artistId: string;
  projectId: string;
  agent: Agent;
}

interface ProjectData {
  type: "track" | "album";
  track?: Track;
  album?: Album;
  template?: Template;
}

function formatMusicalDNA(artist: Artist): string {
  const dna = artist.musical_dna;
  if (!dna) return "";
  return `
## ADN Musical
- Genres: ${dna.genres?.join(", ") || "N/A"}
- Sous-genres: ${dna.subgenres?.join(", ") || "N/A"}
- Références: ${dna.references?.join(", ") || "N/A"}
- Instruments: ${dna.instruments?.join(", ") || "N/A"}
- BPM: ${dna.bpm_range?.min || "?"} - ${dna.bpm_range?.max || "?"}
- Tonalités: ${dna.keys?.join(", ") || "N/A"}
- Tags Suno: ${dna.suno_tags?.join(", ") || "N/A"}`;
}

function formatLyricalDNA(artist: Artist): string {
  const dna = artist.lyrical_dna;
  if (!dna) return "";
  return `
## ADN Lyrique
- Style d'écriture: ${dna.writing_style || "N/A"}
- Thèmes: ${dna.themes?.join(", ") || "N/A"}
- Langues: ${dna.languages?.join(", ") || "N/A"}
- Mots signature: ${dna.signature_words?.join(", ") || "N/A"}
- Thèmes interdits: ${dna.forbidden_themes?.join(", ") || "N/A"}
- Références littéraires: ${dna.literary_references?.join(", ") || "N/A"}`;
}

function formatVisualIdentity(artist: Artist): string {
  const vi = artist.visual_identity;
  if (!vi) return "";
  return `
## Identité Visuelle
- Palette couleurs: ${vi.color_palette?.join(", ") || "N/A"}
- Style visuel: ${vi.visual_style || "N/A"}
- Références visuelles: ${vi.visual_references?.join(", ") || "N/A"}
- Prompt signature: ${vi.signature_prompt || "N/A"}`;
}

function formatLore(artist: Artist): string {
  const lore = artist.lore;
  if (!lore) return "";
  return `
## Lore & Univers
${lore.universe_description || ""}
- Personnages: ${lore.characters?.join(", ") || "N/A"}
- Lieux: ${lore.places?.join(", ") || "N/A"}
- Arc narratif: ${lore.narrative_arc || "N/A"}`;
}

export async function buildContext(options: ContextBuilderOptions): Promise<string> {
  const { agentType, artistId, projectId, agent } = options;
  const pb = getPocketBase();

  const contextParts: string[] = [];

  // 1. Profil artiste (toujours injecté)
  let artist: Artist | null = null;
  try {
    artist = await pb.collection("artists").getOne<Artist>(artistId);
  } catch {
    return interpolateSystemPrompt(agent.system_prompt, "l'artiste");
  }

  contextParts.push(`# Profil Artiste: ${artist.name}`);
  if (artist.bio_short) {
    contextParts.push(`\n${artist.bio_short}`);
  }
  contextParts.push(formatMusicalDNA(artist));
  contextParts.push(formatLyricalDNA(artist));
  contextParts.push(formatVisualIdentity(artist));
  contextParts.push(formatLore(artist));

  // 2. Données du projet
  let projectData: ProjectData | null = null;
  try {
    const project = await pb.collection("projects").getOne(projectId, {
      expand: "track,album,track.template,album",
    });

    projectData = {
      type: project.type,
      track: project.expand?.track,
      album: project.expand?.album,
      template: project.expand?.["track.template"],
    };

    contextParts.push(`\n# Projet en cours: ${project.title}`);
    contextParts.push(`Type: ${project.type === "track" ? "Morceau" : "Album"}`);

    if (projectData.track) {
      const track = projectData.track;
      contextParts.push(`\n## Morceau: ${track.title}`);
      contextParts.push(`Statut: ${track.status}`);
      if (track.concept_sheet) contextParts.push(`Concept: ${track.concept_sheet}`);
      if (track.tags) {
        contextParts.push(
          `Tags: Genre=${track.tags.genre}, Mood=${track.tags.mood}, BPM=${track.tags.bpm}`
        );
      }
    }

    if (projectData.album) {
      const album = projectData.album;
      contextParts.push(`\n## Album: ${album.title}`);
      if (album.concept) contextParts.push(`Concept: ${album.concept}`);
      if (album.lore) contextParts.push(`Lore Album: ${album.lore}`);
    }

    if (projectData.template) {
      const tmpl = projectData.template;
      contextParts.push(`\n## Template: ${tmpl.name}`);
      if (tmpl.structure?.sections) {
        contextParts.push("Structure:");
        tmpl.structure.sections.forEach((s) => {
          contextParts.push(`  - ${s.name} (${s.duration_approx}): ${s.instructions}`);
        });
      }
    }
  } catch {
    // Projet non trouvé, continuer sans
  }

  // 3. Contexte conditionnel selon memory_access
  const memAccess = agent.memory_access || {};

  if (memAccess.all_tracks || agentType === "lore_keeper" || agentType === "artistic_director") {
    try {
      const tracks = await pb.collection("tracks").getList<Track>(1, 20, {
        filter: `artist = "${artistId}"`,
        sort: "-created",
        fields: "id,title,status,concept_sheet,tags,lyrics_raw,prompt_style,prompt_cover",
      });

      if (tracks.items.length > 0) {
        contextParts.push(`\n# Catalogue (${tracks.totalItems} morceaux)`);

        const limit = agentType === "lore_keeper" ? 20 : 5;
        tracks.items.slice(0, limit).forEach((t) => {
          contextParts.push(`\n## ${t.title} [${t.status}]`);
          if (t.concept_sheet) contextParts.push(`Concept: ${t.concept_sheet.slice(0, 200)}...`);
          if (t.tags)
            contextParts.push(
              `Tags: ${t.tags.genre} | ${t.tags.mood} | BPM:${t.tags.bpm}`
            );

          // Lyriste : extrait des lyrics
          if (agentType === "lyricist" && t.lyrics_raw) {
            contextParts.push(`Extrait lyrics: ${t.lyrics_raw.slice(0, 300)}...`);
          }

          // Arrangeur : historique prompts style
          if (agentType === "arranger" && t.prompt_style) {
            contextParts.push(`Prompt Suno: ${t.prompt_style.slice(0, 200)}`);
          }

          // Directeur visuel : historique prompts cover
          if (agentType === "visual_director" && t.prompt_cover) {
            contextParts.push(`Prompt Cover: ${t.prompt_cover.slice(0, 200)}`);
          }
        });
      }
    } catch {
      // Ignore
    }
  }

  if (memAccess.all_albums) {
    try {
      const albums = await pb.collection("albums").getList<Album>(1, 10, {
        filter: `artist = "${artistId}"`,
        sort: "-created",
        fields: "id,title,status,concept,lore",
      });

      if (albums.items.length > 0) {
        contextParts.push(`\n# Albums (${albums.totalItems} albums)`);
        albums.items.forEach((a) => {
          contextParts.push(`\n## ${a.title} [${a.status}]`);
          if (a.concept) contextParts.push(`Concept: ${a.concept.slice(0, 200)}`);
        });
      }
    } catch {
      // Ignore
    }
  }

  // 4. Instructions spécifiques par agent type
  const agentInstructions: Partial<Record<AgentType, string>> = {
    artistic_director: `\n# Instructions Directeur Artistique\nTu as accès au catalogue complet. Guide chaque décision créative pour maximiser la cohérence et l'impact artistique.`,
    lyricist: `\n# Instructions Lyriste\nÉcris toujours deux versions : lyrics_raw (version littéraire) et lyrics_suno (version Suno avec balises). Respecte les thèmes et le style de l'artiste.`,
    arranger: `\n# Instructions Arrangeur\nTes prompts Suno doivent être en ANGLAIS. Optimise pour la génération musicale IA. Inclus toujours : genre, BPM, instruments, mood, énergie.`,
    visual_director: `\n# Instructions Directeur Visuel\nTes prompts d'image doivent être en ANGLAIS. Sois précis sur le style, la composition, l'éclairage, la palette de couleurs.`,
    lore_keeper: `\n# Instructions Lore Keeper\nVérifie toujours la cohérence avec le lore existant. Documente chaque nouvelle addition au canon de l'artiste.`,
    producer: `\n# Instructions Producteur\nSynthétise le travail de tous les agents. Génère des fiches concept structurées et complètes. Focus sur la livraison finale.`,
  };

  if (agentInstructions[agentType]) {
    contextParts.push(agentInstructions[agentType]!);
  }

  // 5. System prompt de l'agent (interpolé)
  const basePrompt = interpolateSystemPrompt(agent.system_prompt, artist.name);

  return `${basePrompt}\n\n---\n\n# CONTEXTE MÉMOIRE\n\n${contextParts.join("\n")}`;
}
