"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Agent, ChatMessage } from "@/types/agent";
import { AGENT_ICONS, AGENT_LABELS, type AgentType } from "@/types/agent";

interface AgentChatProps {
  agent: Agent;
  projectId: string;
  artistId: string;
  sessionId?: string;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  quickActions?: Array<{ label: string; prompt: string }>;
}

interface MessageBubbleProps {
  message: ChatMessage;
  agentIcon: string;
}

function MessageBubble({ message, agentIcon }: MessageBubbleProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
          isUser ? "bg-purple-600" : "bg-zinc-700"
        )}
      >
        {isUser ? "👤" : agentIcon}
      </div>
      <div className={cn("relative max-w-[80%] space-y-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-purple-600 text-white"
              : "rounded-tl-sm bg-zinc-800 text-zinc-100"
          )}
        >
          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
        </div>
        <button
          onClick={handleCopy}
          className="absolute -bottom-6 right-0 flex items-center gap-1 text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-300"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}

export function AgentChat({
  agent,
  projectId,
  artistId,
  sessionId,
  initialMessages = [],
  onMessagesUpdate,
  quickActions = [],
}: AgentChatProps): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const agentIcon = AGENT_ICONS[agent.type as AgentType] || "🤖";
  const agentLabel = agent.name || AGENT_LABELS[agent.type as AgentType] || agent.type;

  const scrollToBottom = useCallback((): void => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            agentId: agent.id,
            projectId,
            artistId,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Pas de stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data) as { content?: string; error?: string };
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: fullContent,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        onMessagesUpdate?.(finalMessages);
      } catch (err) {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `❌ Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        textareaRef.current?.focus();
      }
    },
    [messages, isLoading, agent.id, projectId, artistId, sessionId, onMessagesUpdate]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleClearChat = (): void => {
    setMessages([]);
    onMessagesUpdate?.([]);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-lg">
            {agentIcon}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{agentLabel}</p>
            <p className="text-xs text-zinc-500">{agent.model || "Modèle par défaut"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearChat}
          className="h-8 w-8 text-zinc-500 hover:text-white"
          title="Effacer la conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        <div className="space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-4xl">{agentIcon}</div>
              <p className="text-sm font-medium text-zinc-400">{agentLabel} est prêt</p>
              <p className="mt-1 text-xs text-zinc-600">
                Posez une question ou utilisez une action rapide
              </p>
            </div>
          )}
          {messages.map((message, i) => (
            <MessageBubble key={i} message={message} agentIcon={agentIcon} />
          ))}
          {isLoading && streamingContent && (
            <MessageBubble
              message={{ role: "assistant", content: streamingContent, timestamp: "" }}
              agentIcon={agentIcon}
            />
          )}
          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-sm">
                {agentIcon}
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-zinc-800 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-zinc-400">En train de réfléchir...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {quickActions.length > 0 && messages.length === 0 && (
        <div className="border-t border-zinc-800 px-4 py-3">
          <p className="mb-2 text-xs text-zinc-600">Actions rapides</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => void sendMessage(action.prompt)}
                disabled={isLoading}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-purple-600 hover:text-purple-400 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message à ${agentLabel}... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)`}
            className="min-h-[52px] resize-none border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-purple-600"
            disabled={isLoading}
            rows={2}
          />
          <Button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto w-12 shrink-0 bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
