import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL } from "@/lib/openrouter";

interface SettingsState {
  openrouterApiKey: string;
  falApiKey: string;
  defaultModel: string;
  pocketbaseUrl: string;
  sidebarCollapsed: boolean;
  setOpenrouterApiKey: (key: string) => void;
  setFalApiKey: (key: string) => void;
  setDefaultModel: (model: string) => void;
  setPocketbaseUrl: (url: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openrouterApiKey: "",
      falApiKey: "",
      defaultModel: DEFAULT_MODEL,
      pocketbaseUrl: process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090",
      sidebarCollapsed: false,

      setOpenrouterApiKey: (key) => set({ openrouterApiKey: key }),
      setFalApiKey: (key) => set({ falApiKey: key }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setPocketbaseUrl: (url) => set({ pocketbaseUrl: url }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "studio-ia-settings",
    }
  )
);
