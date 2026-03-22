import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import { StudioClient } from "./StudioClient";
import type { Project } from "@/types/project";
import type { Agent } from "@/types/agent";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string): Promise<{
  project: Project;
  agents: Agent[];
}> {
  const pb = getPocketBase();

  const [project, agents] = await Promise.all([
    pb.collection("projects").getOne<Project>(id, {
      expand: "artist,track,album",
    }).catch(() => null),
    pb.collection("projects").getOne<Project>(id).then(async (p) => {
      return pb.collection("agents").getFullList<Agent>({
        filter: `artist = "${p.artist}"`,
        sort: "type",
      });
    }).catch(() => [] as Agent[]),
  ]);

  if (!project) notFound();

  return { project, agents };
}

export default async function StudioPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { project, agents } = await getData(id);

  return (
    <StudioClient
      project={project}
      agents={agents}
      pbUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090"}
    />
  );
}
