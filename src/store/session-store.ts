import { create } from "zustand";

interface SessionState {
  builder: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  setSession: (builder: any) => void;
  logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  builder: null,
  isAuthenticated: false,
  isLoading: true,

  checkSession: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/builders/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          set({
            builder: data.builder,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
      set({ builder: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Zustand checkSession error:", error);
      set({ builder: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: (builder) => {
    set({ builder, isAuthenticated: !!builder, isLoading: false });
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await fetch("/api/builders/logout", { method: "POST" });
      set({ builder: null, isAuthenticated: false, isLoading: false });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      set({ isLoading: false });
    }
  },
}));
export default useSessionStore;
