import type { AgentType } from "@/types/agent";

export const LORE_KEEPER_TYPE: AgentType = "lore_keeper";

export const loreKeeperQuickActions = [
  {
    label: "Vérifier la cohérence",
    prompt:
      "Vérifie la cohérence narrative de ce morceau avec le lore existant. Y a-t-il des contradictions ? Des connexions intéressantes avec d'autres morceaux ?",
  },
  {
    label: "Enrichir le lore",
    prompt:
      "Propose des éléments de lore à ajouter à l'univers de l'artiste basés sur les thèmes de ce morceau. Nouveaux personnages, lieux, événements narratifs.",
  },
  {
    label: "Connexions narratives",
    prompt:
      "Identifie et documente toutes les connexions narratives entre ce morceau et les autres dans le catalogue. Comment s'inscrit-il dans l'arc narratif global ?",
  },
];
