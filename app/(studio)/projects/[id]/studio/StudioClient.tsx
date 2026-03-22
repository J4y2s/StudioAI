"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentSelector } from "@/components/studio/AgentSelector";
import { AgentChat } from "@/components/studio/AgentChat";
import { PromptBuilder } from "@/components/studio/PromptBuilder";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project, Track } from "@/types/project";
import type { Agent, ChatMessage } from "@/types/agent";
import { AGENT_ICONS, type AgentType } from "@/types/agent";
import { arrangerQuickActions } from "@/lib/agents/arranger";
import { lyricistQuickActions } from "@/lib/agents/lyricist";
import { artisticDirectorQuickActions } from "@/lib/agents/artistic-director";
import { visualDirectorQuickActions } from "@/lib/agents/visual-director";
import { loreKeeperQuickActions } from "@/lib/agents/lore-keeper";
import { producerQuickActions } from "@/lib/agents/producer";

const QUICK_ACTIONS: Partial<Record<AgentType, Array<{ label: string; prompt: string }>>> = {
  artistic_director: artisticDirectorQuickActions,
  lyricist: lyricistQuickActions,
  arranger: arrangerQuickActions,
  visual_director: visualDirectorQuickActions,
  lore_keeper: loreKeeperQuickActions,
  producer: producerQuickActions,
};

interface StudioClientProps {
  project: Project;
  agents: Agent[];
  pbUrl: string;
}

interface TrackData {
  prompt_style: string;
  lyrics_raw: string;
  lyrics_suno: string;
  prompt_cover: string;
  concept_sheet: string;
}

export function StudioClient({ project, agents, pbUrl: _pbUrl }: StudioClientProps): React.ReactElement {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trackData, setTrackData] = useState<TrackData>({
    prompt_style: (project.expand?.track as Track)?.prompt_style || "",
    lyrics_raw: (project.expand?.track as Track)?.lyrics_raw || "",
    lyrics_suno: (project.expand?.track as Track)?.lyrics_suno || "",
    prompt_cover: (project.expand?.track as Track)?.prompt_cover || "",
    concept_sheet: (project.expand?.track as Track)?.concept_sheet || "",
  });

  const artistId = project.artist;
  const trackId = project.track;

  const handleSave = useCallback(async (): Promise<void> => {
    if (!trackId) return;
    setIsSaving(true);
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
      await fetch(`${pbUrl}/api/collections/tracks/records/${trackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackData),
      });
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }, [trackId, trackData]);

  const quickActions = selectedAgent
    ? QUICK_ACTIONS[selectedAgent.type as AgentType] || []
    : [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-sm font-medium text-white">{project.title}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500">
                {project.expand?.artist && (project.expand.artist as { name: string }).name}
              </p>
              <Badge variant="secondary" className="text-xs">
                {project.type === "track" ? "Morceau" : "Album"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="hidden h-8 w-8 text-zinc-500 hover:text-white lg:flex"
            title={showRightPanel ? "Cacher le panel" : "Afficher le panel"}
          >
            {showRightPanel ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop layout */}
        <div className="hidden flex-1 flex-col overflow-hidden lg:flex">
          {/* Agent selector */}
          <div className="border-b border-zinc-800 px-4 py-3">
            <AgentSelector
              agents={agents}
              selectedAgentId={selectedAgent?.id || null}
              onSelect={setSelectedAgent}
            />
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            {selectedAgent ? (
              <AgentChat
                agent={selectedAgent}
                projectId={project.id}
                artistId={artistId}
                quickActions={quickActions}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-zinc-600">Sélectionnez un agent pour commencer</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Prompts */}
        {showRightPanel && (
          <div className="hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-900/50 p-4 lg:block xl:w-96">
            <PromptBuilder
              title="Prompts & Contenus"
              onSave={() => void handleSave()}
              isSaving={isSaving}
              fields={[
                {
                  key: "concept_sheet",
                  label: "Fiche concept",
                  placeholder: "Concept et direction du morceau...",
                  value: trackData.concept_sheet,
                  onChange: (v) => setTrackData((p) => ({ ...p, concept_sheet: v })),
                  rows: 4,
                },
                {
                  key: "prompt_style",
                  label: "Prompt Suno",
                  placeholder: "Prompt style pour Suno AI (en anglais)...",
                  value: trackData.prompt_style,
                  onChange: (v) => setTrackData((p) => ({ ...p, prompt_style: v })),
                  rows: 4,
                },
                {
                  key: "lyrics_suno",
                  label: "Lyrics Suno",
                  placeholder: "[Verse]\n...\n[Chorus]\n...",
                  value: trackData.lyrics_suno,
                  onChange: (v) => setTrackData((p) => ({ ...p, lyrics_suno: v })),
                  rows: 8,
                },
                {
                  key: "lyrics_raw",
                  label: "Lyrics (version littéraire)",
                  placeholder: "Version poétique des paroles...",
                  value: trackData.lyrics_raw,
                  onChange: (v) => setTrackData((p) => ({ ...p, lyrics_raw: v })),
                  rows: 6,
                },
                {
                  key: "prompt_cover",
                  label: "Prompt Cover",
                  placeholder: "Prompt pour générer la cover (en anglais)...",
                  value: trackData.prompt_cover,
                  onChange: (v) => setTrackData((p) => ({ ...p, prompt_cover: v })),
                  rows: 4,
                },
              ]}
            />
          </div>
        )}

        {/* Mobile layout - Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-4 my-2 bg-zinc-800">
              <TabsTrigger value="chat" className="flex-1 text-xs">
                Chat
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex-1 text-xs">
                Prompts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
              <div className="flex flex-col h-full">
                <div className="border-b border-zinc-800 px-4 py-2 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                          selectedAgent?.id === agent.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400"
                        )}
                      >
                        <span>{AGENT_ICONS[agent.type as AgentType]}</span>
                        {agent.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {selectedAgent && (
                    <AgentChat
                      agent={selectedAgent}
                      projectId={project.id}
                      artistId={artistId}
                      quickActions={quickActions}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="flex-1 overflow-y-auto m-0 p-4">
              <PromptBuilder
                onSave={() => void handleSave()}
                isSaving={isSaving}
                fields={[
                  {
                    key: "prompt_style",
                    label: "Prompt Suno",
                    placeholder: "Prompt style...",
                    value: trackData.prompt_style,
                    onChange: (v) => setTrackData((p) => ({ ...p, prompt_style: v })),
                  },
                  {
                    key: "lyrics_suno",
                    label: "Lyrics Suno",
                    placeholder: "[Verse]\n...",
                    value: trackData.lyrics_suno,
                    onChange: (v) => setTrackData((p) => ({ ...p, lyrics_suno: v })),
                    rows: 6,
                  },
                  {
                    key: "prompt_cover",
                    label: "Prompt Cover",
                    placeholder: "Cover prompt...",
                    value: trackData.prompt_cover,
                    onChange: (v) => setTrackData((p) => ({ ...p, prompt_cover: v })),
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
