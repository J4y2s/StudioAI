import type { AgentType } from "@/types/agent";

export const ARTISTIC_DIRECTOR_TYPE: AgentType = "artistic_director";

export const artisticDirectorQuickActions = [
  {
    label: "Définir la direction créative",
    prompt:
      "Analyse le projet en cours et propose une direction créative claire pour ce morceau. Prends en compte l'ADN musical de l'artiste et le lore.",
  },
  {
    label: "Analyser la cohérence",
    prompt:
      "Analyse la cohérence de ce projet avec le reste du catalogue de l'artiste. Y a-t-il des risques de répétition ou de contradiction avec d'autres morceaux ?",
  },
  {
    label: "Brainstormer des concepts",
    prompt:
      "Propose 5 concepts originaux pour un nouveau morceau qui renforcerait l'identité artistique et serait cohérent avec le lore existant.",
  },
];
