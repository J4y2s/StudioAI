"use client";

import React, { useState, useEffect } from "react";
import { Bot, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AGENT_ICONS, AGENT_LABELS, type AgentType } from "@/types/agent";
import { AVAILABLE_MODELS } from "@/lib/openrouter";
import type { Agent } from "@/types/agent";
import type { Artist } from "@/types/artist";

export default function AgentsPage(): React.ReactElement {
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
    fetch(`${pbUrl}/api/collections/artists/records?sort=name`)
      .then((r) => r.json())
      .then((data: { items: Artist[] }) => {
        setArtists(data.items || []);
        if (data.items.length > 0) {
          setSelectedArtistId(data.items[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedArtistId) return;
    setIsLoading(true);
    fetch(`/api/agents?artistId=${selectedArtistId}`)
      .then((r) => r.json())
      .then((data: Agent[]) => {
        setAgents(Array.isArray(data) ? data : []);
        setEditingAgent(null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedArtistId]);

  const handleSave = async (): Promise<void> => {
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
      await fetch(`${pbUrl}/api/collections/agents/records/${editingAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingAgent.name,
          system_prompt: editingAgent.system_prompt,
          model: editingAgent.model,
          temperature: editingAgent.temperature,
          memory_access: editingAgent.memory_access,
        }),
      });

      setAgents((prev) =>
        prev.map((a) => (a.id === editingAgent.id ? editingAgent : a))
      );
      toast({ title: "Agent sauvegardé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitAgents = async (): Promise<void> => {
    if (!selectedArtistId) return;
    const artist = artists.find((a) => a.id === selectedArtistId);
    if (!artist) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: selectedArtistId, artistName: artist.name }),
      });
      const data = await res.json() as { created: number };
      toast({ title: `${data.created} agent(s) créé(s)` });

      // Reload agents
      const agentsRes = await fetch(`/api/agents?artistId=${selectedArtistId}`);
      const agentsData = await agentsRes.json() as Agent[];
      setAgents(Array.isArray(agentsData) ? agentsData : []);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar agents */}
      <div className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4">
        <h1 className="mb-4 text-lg font-bold text-white">Agents IA</h1>

        <div className="mb-4">
          <Label className="text-xs text-zinc-400">Artiste</Label>
          <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
            <SelectTrigger className="mt-1.5 border-zinc-700 bg-zinc-800 text-white text-sm">
              <SelectValue placeholder="Choisir un artiste" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800">
              {artists.map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-white">
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedArtistId && agents.length === 0 && !isLoading && (
          <Button
            onClick={() => void handleInitAgents()}
            className="mb-4 w-full bg-purple-600 hover:bg-purple-700 text-sm"
          >
            Initialiser les agents
          </Button>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setEditingAgent({ ...agent })}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  editingAgent?.id === agent.id
                    ? "bg-purple-600/20 text-purple-300"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-base">{AGENT_ICONS[agent.type as AgentType]}</span>
                <span>{agent.name || AGENT_LABELS[agent.type as AgentType]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {!editingAgent ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">Sélectionnez un agent pour le configurer</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {AGENT_ICONS[editingAgent.type as AgentType]} {editingAgent.name || AGENT_LABELS[editingAgent.type as AgentType]}
              </h2>
              <Button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Sauvegarder</>
                )}
              </Button>
            </div>

            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-zinc-400">Nom</Label>
                  <Input
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent((p) => p ? { ...p, name: e.target.value } : p)}
                    className="mt-1.5 border-zinc-700 bg-zinc-800 text-white"
                  />
                </div>

                <div>
                  <Label className="text-xs text-zinc-400">Modèle OpenRouter</Label>
                  <Select
                    value={editingAgent.model}
                    onValueChange={(v) => setEditingAgent((p) => p ? { ...p, model: v } : p)}
                  >
                    <SelectTrigger className="mt-1.5 border-zinc-700 bg-zinc-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-800">
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-white text-xs">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-zinc-400">
                    Température: {editingAgent.temperature}
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={editingAgent.temperature}
                    onChange={(e) =>
                      setEditingAgent((p) => p ? { ...p, temperature: parseFloat(e.target.value) } : p)
                    }
                    className="mt-1.5 w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>Précis</span>
                    <span>Créatif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">System Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editingAgent.system_prompt}
                  onChange={(e) =>
                    setEditingAgent((p) => p ? { ...p, system_prompt: e.target.value } : p)
                  }
                  rows={12}
                  className="border-zinc-700 bg-zinc-800 text-sm text-zinc-200 font-mono"
                />
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">Accès Mémoire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "artist_profile" as const, label: "Profil artiste" },
                  { key: "lore" as const, label: "Lore & Univers" },
                  { key: "all_tracks" as const, label: "Tous les morceaux" },
                  { key: "all_albums" as const, label: "Tous les albums" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label className="text-sm text-zinc-300">{item.label}</Label>
                    <Switch
                      checked={editingAgent.memory_access?.[item.key] ?? false}
                      onCheckedChange={(checked) =>
                        setEditingAgent((p) =>
                          p
                            ? {
                                ...p,
                                memory_access: { ...p.memory_access, [item.key]: checked },
                              }
                            : p
                        )
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
