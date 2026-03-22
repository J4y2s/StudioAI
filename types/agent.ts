export type AgentType =
  | "artistic_director"
  | "lyricist"
  | "arranger"
  | "visual_director"
  | "lore_keeper"
  | "producer";

export interface AgentMemoryAccess {
  artist_profile: boolean;
  lore: boolean;
  all_tracks: boolean;
  all_albums: boolean;
}

export interface Agent {
  id: string;
  artist: string;
  type: AgentType;
  name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  memory_access: AgentMemoryAccess;
  created: string;
  updated: string;
  expand?: {
    artist?: import("./artist").Artist;
  };
}

export type AgentCreate = Omit<Agent, "id" | "created" | "updated" | "expand">;
export type AgentUpdate = Partial<AgentCreate>;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  project: string;
  agent: string;
  messages: ChatMessage[];
  created: string;
  updated: string;
  expand?: {
    project?: import("./project").Project;
    agent?: Agent;
  };
}

export type SessionCreate = Omit<Session, "id" | "created" | "updated" | "expand">;
export type SessionUpdate = Partial<SessionCreate>;

export const AGENT_LABELS: Record<AgentType, string> = {
  artistic_director: "Directeur Artistique",
  lyricist: "Lyriste",
  arranger: "Arrangeur",
  visual_director: "Directeur Visuel",
  lore_keeper: "Lore Keeper",
  producer: "Producteur",
};

export const AGENT_ICONS: Record<AgentType, string> = {
  artistic_director: "🎬",
  lyricist: "✍️",
  arranger: "🎼",
  visual_director: "🖼️",
  lore_keeper: "📖",
  producer: "🎧",
};

export const AGENT_COLORS: Record<AgentType, string> = {
  artistic_director: "bg-purple-500",
  lyricist: "bg-blue-500",
  arranger: "bg-green-500",
  visual_director: "bg-pink-500",
  lore_keeper: "bg-amber-500",
  producer: "bg-red-500",
};
