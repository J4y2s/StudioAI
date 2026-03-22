"use client";

import React, { useState } from "react";
import { Key, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/settings.store";
import { AVAILABLE_MODELS } from "@/lib/openrouter";

type TestStatus = "idle" | "testing" | "success" | "error";

export default function SettingsPage(): React.ReactElement {
  const { toast } = useToast();
  const {
    openrouterApiKey,
    falApiKey,
    defaultModel,
    setOpenrouterApiKey,
    setFalApiKey,
    setDefaultModel,
  } = useSettingsStore();

  const [orStatus, setOrStatus] = useState<TestStatus>("idle");
  const [falStatus, setFalStatus] = useState<TestStatus>("idle");
  const [showOrKey, setShowOrKey] = useState(false);
  const [showFalKey, setShowFalKey] = useState(false);

  const testOpenRouter = async (): Promise<void> => {
    setOrStatus("testing");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Dis bonjour en 1 mot", timestamp: new Date().toISOString() }],
          agentId: "test",
          projectId: "test",
          artistId: "test",
        }),
      });
      setOrStatus(res.status !== 404 ? "success" : "error");
    } catch {
      setOrStatus("error");
    }
  };

  const handleSave = (): void => {
    toast({ title: "Paramètres sauvegardés" });
  };

  const StatusIcon = ({ status }: { status: TestStatus }): React.ReactElement | null => {
    if (status === "idle") return null;
    if (status === "testing") return <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />;
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-zinc-500">Configurez vos clés API et vos préférences</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* OpenRouter */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/20">
                <Key className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">OpenRouter</CardTitle>
                <CardDescription className="text-xs">
                  Accès aux modèles LLM (Claude, GPT-4, etc.)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400">Clé API</Label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showOrKey ? "text" : "password"}
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="border-zinc-700 bg-zinc-800 text-white pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOrKey(!showOrKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                  >
                    {showOrKey ? "Cacher" : "Voir"}
                  </button>
                </div>
                <div className="flex items-center">
                  <StatusIcon status={orStatus} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-zinc-400">Modèle par défaut</Label>
              <Select value={defaultModel} onValueChange={setDefaultModel}>
                <SelectTrigger className="mt-1.5 border-zinc-700 bg-zinc-800 text-white text-sm">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => void testOpenRouter()}
              disabled={orStatus === "testing" || !openrouterApiKey}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              Tester la connexion
            </Button>
          </CardContent>
        </Card>

        {/* Fal.ai */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-600/20">
                <Key className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">Fal.ai</CardTitle>
                <CardDescription className="text-xs">
                  Génération d&apos;images pour les covers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400">Clé API</Label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showFalKey ? "text" : "password"}
                    value={falApiKey}
                    onChange={(e) => setFalApiKey(e.target.value)}
                    placeholder="fal_..."
                    className="border-zinc-700 bg-zinc-800 text-white pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFalKey(!showFalKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                  >
                    {showFalKey ? "Cacher" : "Voir"}
                  </button>
                </div>
                <div className="flex items-center">
                  <StatusIcon status={falStatus} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-zinc-800" />

        {/* PocketBase info */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm text-white">PocketBase</CardTitle>
            <CardDescription className="text-xs">
              Base de données locale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
              <span className="text-xs text-zinc-400">URL</span>
              <span className="text-xs text-zinc-300 font-mono">
                {process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090"}
              </span>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090"}/_/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Ouvrir l&apos;interface admin PocketBase
            </a>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}
