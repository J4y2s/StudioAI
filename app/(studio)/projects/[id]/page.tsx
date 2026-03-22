import { getPocketBase } from "@/lib/pocketbase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const pb = getPocketBase();

  let project: Project;
  try {
    project = await pb.collection("projects").getOne<Project>(id, {
      expand: "artist,track,album",
    });
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
            <Mic2 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{project.title}</h1>
            <p className="text-xs text-zinc-500">
              {project.expand?.artist && (project.expand.artist as { name: string }).name}
            </p>
          </div>
        </div>
        <Link href={`/projects/${project.id}/studio`}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Ouvrir le Studio
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-xs text-zinc-500">Type</dt>
            <dd className="text-sm text-white">
              <Badge variant="secondary">{project.type === "track" ? "Morceau" : "Album"}</Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-xs text-zinc-500">Statut</dt>
            <dd className="text-sm text-white">
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status === "active" ? "Actif" : "Archivé"}
              </Badge>
            </dd>
          </div>
          {project.expand?.artist && (
            <div className="flex justify-between">
              <dt className="text-xs text-zinc-500">Artiste</dt>
              <dd className="text-sm text-white">{(project.expand.artist as { name: string }).name}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
