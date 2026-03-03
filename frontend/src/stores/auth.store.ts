import { create } from "zustand";
import type { User } from "firebase/auth";
import type { UserProfile } from "../types/auth";
import { AuthService } from "../services/auth.service";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  init: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  init: () => {
    const unsub = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await AuthService.getUserProfile(user.uid);
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
    return unsub;
  },

  signIn: async (email, password) => {
    await AuthService.signIn(email, password);
  },

  signUp: async (email, password, username) => {
    await AuthService.signUp(email, password, username);
  },

  signInWithGoogle: async () => {
    await AuthService.signInWithGoogle();
  },

  signOut: async () => {
    await AuthService.signOut();
  },
}));
