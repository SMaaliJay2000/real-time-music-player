import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
  albums: Album[];
  songs: Song[];
  currentAlbum: Album | null;
  isLoding: boolean;
  error: string | null;
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  featuredSongs: Song[];
  stats: Stats;

  fetchAlbums: () => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchTrendingSongs: () => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSongs: () => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
  albums: [],
  songs: [],
  currentAlbum: null,
  isLoding: false,
  error: null,
  madeForYouSongs: [],
  trendingSongs: [],
  featuredSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0,
  },

  fetchAlbums: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/albums");
      set({ albums: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchAlbumById: async (id) => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get(`/albums/${id}`);
      set({ currentAlbum: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchMadeForYouSongs: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/made-for-you");
      set({ madeForYouSongs: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchTrendingSongs: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/trending");
      set({ trendingSongs: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchFeaturedSongs: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/featured");
      set({ featuredSongs: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchStats: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/stats");
      set({ stats: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoding: false });
    }
  },

  fetchSongs: async () => {
    set({ isLoding: true, error: null });
    try {
      const response = await axiosInstance.get("/songs");
      set({ songs: response.data });
    } catch (error: any) {
      console.log(error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },
  deleteSong: async (id) => {
    set({ isLoding: true, error: null });
    try {
      await axiosInstance.delete(`/admin/songs/${id}`);
      set((state) => ({
        songs: state.songs.filter((song) => song._id !== id),
      }));
      toast.success("Song deleted successfully");
    } catch (error: any) {
      console.log(error);
      toast.error("Error deleting song");
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },
  deleteAlbum: async (id) => {
    set({ isLoding: true, error: null });
    try {
      await axiosInstance.delete(`/admin/albums/${id}`);
      set((state) => ({
        albums: state.albums.filter((album) => album._id !== id),
        songs: state.songs.map((song) =>
          song.albumId === state.albums.find((a) => a._id === id)?.title
            ? { ...song, album: null }
            : song
        ),
      }));
      toast.success("Album deleted successfully");
    } catch (error: any) {
      console.log(error);
      toast.error("Error deleting album");
      set({ error: error.response.data.message });
    } finally {
      set({ isLoding: false });
    }
  },
}));
