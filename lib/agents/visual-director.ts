import type { AgentType } from "@/types/agent";

export const VISUAL_DIRECTOR_TYPE: AgentType = "visual_director";

export const visualDirectorQuickActions = [
  {
    label: "Générer prompt cover",
    prompt:
      "Crée un prompt détaillé pour générer la cover de ce morceau via Fal.ai. Respecte l'identité visuelle de l'artiste et capture l'ambiance du morceau. Le prompt doit être en anglais.",
  },
  {
    label: "3 variantes visuelles",
    prompt:
      "Propose 3 concepts visuels différents pour la cover : version minimaliste, version cinématographique, et version expérimentale. Donne les prompts complets pour chaque.",
  },
  {
    label: "Prompt pochette album",
    prompt:
      "Génère un prompt pour la pochette d'album qui capture le concept global et l'identité visuelle de l'artiste, tout en étant cohérent avec la direction du projet.",
  },
];
