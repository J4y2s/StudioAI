import { getPocketBase } from "@/lib/pocketbase";
import Link from "next/link";
import { Plus, FolderOpen, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/project";

async function getProjects(): Promise<Project[]> {
  const pb = getPocketBase();
  try {
    const result = await pb.collection("projects").getFullList<Project>({
      sort: "-updated",
      expand: "artist",
    });
    return result;
  } catch {
    return [];
  }
}

export default async function ProjectsPage(): Promise<React.ReactElement> {
  const projects = await getProjects();
  const activeProjects = projects.filter((p) => p.status === "active");
  const archivedProjects = projects.filter((p) => p.status === "archived");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Projets</h1>
          <p className="text-sm text-zinc-500">{activeProjects.length} projet{activeProjects.length !== 1 ? "s" : ""} actif{activeProjects.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-zinc-700" />
          <h2 className="mb-2 text-lg font-medium text-zinc-400">Aucun projet</h2>
          <p className="mb-6 text-sm text-zinc-600">Créez un projet pour commencer une session studio</p>
          <Link href="/projects/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeProjects.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Projets actifs
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}/studio`}>
                    <div className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-purple-600/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/20">
                            <Mic2 className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white group-hover:text-purple-300">
                              {project.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {project.expand?.artist?.name || "—"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {project.type === "track" ? "Morceau" : "Album"}
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs text-zinc-600">
                        Mis à jour {formatDate(project.updated)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {archivedProjects.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Archivés
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                {archivedProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}/studio`}>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                      <p className="text-sm font-medium text-zinc-400">{project.title}</p>
                      <p className="text-xs text-zinc-600">{project.expand?.artist?.name || "—"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
