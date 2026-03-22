"use client";

import React, { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PromptField {
  key: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

interface PromptBuilderProps {
  fields: PromptField[];
  onSave?: () => void;
  isSaving?: boolean;
  title?: string;
  className?: string;
}

function CopyButton({ text }: { text: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={() => void handleCopy()}
      disabled={!text}
      className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copié!" : "Copier"}
    </button>
  );
}

export function PromptBuilder({
  fields,
  onSave,
  isSaving,
  title = "Prompts & Contenus",
  className,
}: PromptBuilderProps): React.ReactElement {
  const handleExport = (): void => {
    const content = fields
      .filter((f) => f.value)
      .map((f) => `## ${f.label}\n${f.value}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-ia-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 gap-1 px-2 text-xs text-zinc-500 hover:text-white"
          >
            <Download className="h-3 w-3" />
            Exporter
          </Button>
          {onSave && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-7 bg-purple-600 px-3 text-xs hover:bg-purple-700"
            >
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">{field.label}</Label>
              <CopyButton text={field.value} />
            </div>
            <Textarea
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className="border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-600"
            />
            {field.value && (
              <p className="text-right text-xs text-zinc-600">
                {field.value.length} caractères
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
