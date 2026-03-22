import { fal } from "@fal-ai/client";

export function initFal(): void {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error("FAL_API_KEY n'est pas configurée");
  }
  fal.config({ credentials: apiKey });
}

export interface GenerateImageOptions {
  prompt: string;
  negative_prompt?: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  model?: string;
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

export interface GenerateImageResult {
  images: GeneratedImage[];
  prompt: string;
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  initFal();

  const model = options.model || "fal-ai/flux/schnell";

  const result = await fal.subscribe(model, {
    input: {
      prompt: options.prompt,
      negative_prompt: options.negative_prompt,
      image_size: options.image_size || "square_hd",
      num_inference_steps: options.num_inference_steps || 4,
      num_images: options.num_images || 1,
    },
    logs: false,
  });

  const output = result.data as {
    images: GeneratedImage[];
    prompt: string;
  };

  return {
    images: output.images || [],
    prompt: options.prompt,
  };
}

export const FAL_MODELS = [
  { id: "fal-ai/flux/schnell", name: "FLUX Schnell (rapide)" },
  { id: "fal-ai/flux/dev", name: "FLUX Dev (qualité)" },
  { id: "fal-ai/flux-realism", name: "FLUX Realism" },
  { id: "fal-ai/stable-diffusion-v3-medium", name: "Stable Diffusion 3 Medium" },
  { id: "fal-ai/aura-flow", name: "AuraFlow" },
] as const;
