import { NextRequest, NextResponse } from "next/server";
import { generateImage, type GenerateImageOptions } from "@/lib/fal";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as GenerateImageOptions;

    if (!body.prompt) {
      return NextResponse.json({ error: "Le prompt est requis" }, { status: 400 });
    }

    const result = await generateImage(body);

    return NextResponse.json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erreur de génération d'image";
    return NextResponse.json({ error }, { status: 500 });
  }
}
