import { NextRequest, NextResponse } from "next/server";
import { getPocketBase } from "@/lib/pocketbase";
import { DEFAULT_SYSTEM_PROMPTS, getDefaultAgentName } from "@/lib/agents/base-agent";
import type { AgentType, AgentCreate } from "@/types/agent";

// GET /api/agents?artistId=xxx
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get("artistId");

  if (!artistId) {
    return NextResponse.json({ error: "artistId requis" }, { status: 400 });
  }

  const pb = getPocketBase();
  try {
    const agents = await pb.collection("agents").getFullList({
      filter: `artist = "${artistId}"`,
      sort: "type",
    });
    return NextResponse.json(agents);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/agents — Initialise les agents par défaut pour un artiste
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { artistId: string; artistName: string };
  const { artistId, artistName } = body;

  if (!artistId || !artistName) {
    return NextResponse.json({ error: "artistId et artistName requis" }, { status: 400 });
  }

  const pb = getPocketBase();
  const agentTypes: AgentType[] = [
    "artistic_director",
    "lyricist",
    "arranger",
    "visual_director",
    "lore_keeper",
    "producer",
  ];

  const created = [];
  for (const type of agentTypes) {
    // Vérifier si l'agent existe déjà
    const existing = await pb.collection("agents").getList(1, 1, {
      filter: `artist = "${artistId}" && type = "${type}"`,
    });

    if (existing.totalItems === 0) {
      const systemPrompt = DEFAULT_SYSTEM_PROMPTS[type](artistName);
      const agentData: AgentCreate = {
        artist: artistId,
        type,
        name: getDefaultAgentName(type),
        system_prompt: systemPrompt,
        model: "anthropic/claude-3.5-sonnet",
        temperature: 0.8,
        memory_access: {
          artist_profile: true,
          lore: true,
          all_tracks: type === "artistic_director" || type === "lore_keeper",
          all_albums: type === "artistic_director" || type === "producer",
        },
      };

      const agent = await pb.collection("agents").create(agentData);
      created.push(agent);
    }
  }

  return NextResponse.json({ created: created.length, agents: created });
}
