import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const defaultMode: ThemeMode = (() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Try to detect from system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
})();

export const useThemeStore = create<ThemeState>((set) => ({
  mode: defaultMode,
  setMode: (mode: ThemeMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', mode);
    }
    set({ mode });
  },
  toggleMode: () => {
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-theme', newMode);
      }
      return { mode: newMode };
    });
  },
}));
