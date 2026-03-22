import type { AgentType } from "@/types/agent";

export const ARRANGER_TYPE: AgentType = "arranger";

export const arrangerQuickActions = [
  {
    label: "Générer prompt Suno",
    prompt:
      "Génère un prompt style optimisé pour Suno AI pour ce morceau. Inclus : genre, sous-genre, instruments, mood, tempo, énergie, et tous les tags Suno pertinents. Le prompt doit être en anglais.",
  },
  {
    label: "Variantes de style",
    prompt:
      "Propose 3 variantes de prompts Suno pour ce morceau : une version mainstream, une version expérimentale, et une version qui maximise l'identité unique de l'artiste.",
  },
  {
    label: "Optimiser le prompt",
    prompt:
      "Analyse et optimise le prompt Suno existant. Ajoute les tags manquants, améliore la structure, et assure-toi qu'il est compatible avec les dernières fonctionnalités de Suno.",
  },
];
