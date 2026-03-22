import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";
import { buildContext } from "@/lib/memory/context-builder";
import { getPocketBase } from "@/lib/pocketbase";
import type { Agent, ChatMessage } from "@/types/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  messages: ChatMessage[];
  agentId: string;
  projectId: string;
  artistId: string;
  sessionId?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages, agentId, projectId, artistId, sessionId } = body;

    if (!agentId || !projectId || !artistId) {
      return NextResponse.json(
        { error: "agentId, projectId et artistId sont requis" },
        { status: 400 }
      );
    }

    const pb = getPocketBase();

    // Récupérer l'agent
    let agent: Agent;
    try {
      agent = await pb.collection("agents").getOne<Agent>(agentId);
    } catch {
      return NextResponse.json({ error: "Agent non trouvé" }, { status: 404 });
    }

    // Construire le contexte mémoire
    const systemPromptWithContext = await buildContext({
      agentType: agent.type,
      artistId,
      projectId,
      agent,
    });

    // Préparer les messages pour l'API
    const openai = getOpenRouterClient();
    const model = agent.model || process.env.DEFAULT_MODEL || "anthropic/claude-3.5-sonnet";
    const temperature = agent.temperature ?? 0.8;

    const apiMessages = [
      { role: "system" as const, content: systemPromptWithContext },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream la réponse
    const stream = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      temperature,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              fullContent += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
            }
          }

          // Sauvegarder en session si sessionId fourni
          if (sessionId && fullContent) {
            try {
              const session = await pb.collection("sessions").getOne(sessionId);
              const updatedMessages: ChatMessage[] = [
                ...(session.messages || []),
                ...messages.filter(
                  (m) => !session.messages?.some(
                    (sm: ChatMessage) => sm.timestamp === m.timestamp && sm.role === m.role
                  )
                ),
                {
                  role: "assistant" as const,
                  content: fullContent,
                  timestamp: new Date().toISOString(),
                },
              ];
              await pb.collection("sessions").update(sessionId, {
                messages: updatedMessages,
              });
            } catch {
              // Ignore session save errors
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          const error = err instanceof Error ? err.message : "Erreur inconnue";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error }, { status: 500 });
  }
}
