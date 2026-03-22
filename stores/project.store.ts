import { create } from "zustand";
import type { Project } from "@/types/project";

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  selectedProjectId: null,
  selectedProject: null,

  setProjects: (projects) => {
    set({ projects });
    const { selectedProjectId } = get();
    if (selectedProjectId) {
      const found = projects.find((p) => p.id === selectedProjectId);
      set({ selectedProject: found || null });
    }
  },

  setSelectedProject: (project) =>
    set({
      selectedProject: project,
      selectedProjectId: project?.id || null,
    }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      selectedProject:
        state.selectedProjectId === id
          ? { ...state.selectedProject!, ...updates }
          : state.selectedProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      selectedProject: state.selectedProjectId === id ? null : state.selectedProject,
    })),
}));
