import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artist } from "@/types/artist";

interface ArtistState {
  artists: Artist[];
  selectedArtistId: string | null;
  selectedArtist: Artist | null;
  setArtists: (artists: Artist[]) => void;
  setSelectedArtist: (artist: Artist | null) => void;
  selectArtistById: (id: string) => void;
  addArtist: (artist: Artist) => void;
  updateArtist: (id: string, artist: Partial<Artist>) => void;
  removeArtist: (id: string) => void;
}

export const useArtistStore = create<ArtistState>()(
  persist(
    (set, get) => ({
      artists: [],
      selectedArtistId: null,
      selectedArtist: null,

      setArtists: (artists) => {
        set({ artists });
        // Update selected artist if it exists
        const { selectedArtistId } = get();
        if (selectedArtistId) {
          const found = artists.find((a) => a.id === selectedArtistId);
          set({ selectedArtist: found || null });
        }
      },

      setSelectedArtist: (artist) =>
        set({
          selectedArtist: artist,
          selectedArtistId: artist?.id || null,
        }),

      selectArtistById: (id) => {
        const { artists } = get();
        const artist = artists.find((a) => a.id === id) || null;
        set({ selectedArtistId: id, selectedArtist: artist });
      },

      addArtist: (artist) =>
        set((state) => ({ artists: [...state.artists, artist] })),

      updateArtist: (id, updates) =>
        set((state) => ({
          artists: state.artists.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          selectedArtist:
            state.selectedArtistId === id
              ? { ...state.selectedArtist!, ...updates }
              : state.selectedArtist,
        })),

      removeArtist: (id) =>
        set((state) => ({
          artists: state.artists.filter((a) => a.id !== id),
          selectedArtistId: state.selectedArtistId === id ? null : state.selectedArtistId,
          selectedArtist: state.selectedArtistId === id ? null : state.selectedArtist,
        })),
    }),
    {
      name: "studio-ia-artists",
      partialize: (state: ArtistState) => ({ selectedArtistId: state.selectedArtistId }),
    }
  )
);
