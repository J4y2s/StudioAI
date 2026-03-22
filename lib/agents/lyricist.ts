import type { AgentType } from "@/types/agent";

export const LYRICIST_TYPE: AgentType = "lyricist";

export const lyricistQuickActions = [
  {
    label: "Générer les lyrics",
    prompt:
      "Écris les paroles complètes pour ce morceau. Produis deux versions : lyrics_raw (version littéraire soignée) et lyrics_suno (version formatée pour Suno AI avec balises [Verse], [Chorus], [Bridge] etc.).",
  },
  {
    label: "Affiner le refrain",
    prompt:
      "Concentre-toi sur le refrain. Propose 3 versions différentes du refrain avec des approches distinctes (accrocheur/poétique/narratif).",
  },
  {
    label: "Version Suno",
    prompt:
      "Reformate les lyrics existants au format Suno AI optimal avec toutes les balises de section appropriées ([Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]).",
  },
];
