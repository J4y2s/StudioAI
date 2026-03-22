import type { AgentType } from "@/types/agent";

export const PRODUCER_TYPE: AgentType = "producer";

export const producerQuickActions = [
  {
    label: "Fiche concept finale",
    prompt:
      "Génère la fiche concept complète et finale de ce morceau. Inclus : titre, concept, direction artistique, structure, prompt Suno, lyrics Suno, prompt cover, connexions lore, et statut de chaque élément.",
  },
  {
    label: "Synthèse du projet",
    prompt:
      "Fais une synthèse complète de l'état actuel du projet. Qu'est-ce qui est prêt ? Qu'est-ce qui manque ? Quelles sont les prochaines étapes ?",
  },
  {
    label: "Check-list production",
    prompt:
      "Génère une check-list de production pour ce morceau avec tous les éléments nécessaires pour avoir un livrable complet prêt pour Suno AI et la publication.",
  },
];
