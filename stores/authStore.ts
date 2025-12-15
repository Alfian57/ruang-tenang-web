import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 30, // 30 days (token validity controls actual session)
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

// Custom storage using cookies for persistence
const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const value = Cookies.get(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    Cookies.set(name, value, COOKIE_OPTIONS);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    Cookies.remove(name);
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true });
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const response: any = await api.login(email, password, rememberMe);
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          await api.register(name, email, password);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Also clear the cookie explicitly
        Cookies.remove("auth-storage");
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response: any = await api.getProfile(token);
          set({ user: response.data });
        } catch (error) {
          // Token might be expired
          get().logout();
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating auth state:", error);
        }
        // Always mark as hydrated, even if there's no stored state
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Initialize hydration immediately on client side
if (typeof window !== "undefined") {
  // Force hydration check after a small delay to ensure cookie is read
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (!state.isHydrated) {
      state.setHydrated(true);
    }
  }, 100);
}

// Hook to check if store is hydrated (for SSR)
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
