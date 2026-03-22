"use client";

import { AGENT_ICONS, AGENT_LABELS, type AgentType } from "@/types/agent";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";
import { AGENT_COLORS } from "@/types/agent";

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelect: (agent: Agent) => void;
  className?: string;
}

export function AgentSelector({
  agents,
  selectedAgentId,
  onSelect,
  className,
}: AgentSelectorProps): React.ReactElement {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {agents.map((agent) => {
        const isSelected = agent.id === selectedAgentId;
        const icon = AGENT_ICONS[agent.type as AgentType] || "🤖";
        const label = agent.name || AGENT_LABELS[agent.type as AgentType] || agent.type;
        const colorClass = AGENT_COLORS[agent.type as AgentType] || "bg-gray-500";

        return (
          <button
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              isSelected
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                isSelected ? "bg-white/20" : colorClass
              )}
            >
              {icon}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
