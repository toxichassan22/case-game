// ── Profile Store ─────────────────────────────────────────────────────
// Persists player profile to localStorage using zustand persist middleware.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const VALID_SPECIALTIES = new Set(['timeline', 'forensics', 'behavioral']);

export interface PlayerProfile {
  playerId: string;
  name: string;
  avatarId: string;
  stats: {
    casesSolved: number;
    winRate: number;
    mostUsedSpecialty: string;
    totalGames: number;
  };
}

interface ProfileState {
  profile: PlayerProfile | null;
  recordedCaseResults: string[];
  setProfile: (name: string, avatarId: string) => void;
  updateStats: (won: boolean, resultKey: string) => void;
  clearProfile: () => void;
  hasProfile: () => boolean;
  ensurePlayerId: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      recordedCaseResults: [],

      setProfile: (name: string, avatarId: string) => {
        const playerId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set({
          profile: {
            playerId,
            name,
            avatarId,
            stats: {
              casesSolved: 0,
              winRate: 0,
              mostUsedSpecialty: '',
              totalGames: 0,
            },
          },
          recordedCaseResults: [],
        });
      },

      updateStats: (won: boolean, resultKey: string) => {
        const current = get().profile;
        const recordedCaseResults = get().recordedCaseResults ?? [];
        if (!current || !resultKey || recordedCaseResults.includes(resultKey)) return;

        const totalGames = current.stats.totalGames + 1;
        const casesSolved = current.stats.casesSolved + (won ? 1 : 0);
        const winRate = totalGames > 0 ? Math.round((casesSolved / totalGames) * 100) : 0;

        set({
          recordedCaseResults: [...recordedCaseResults, resultKey],
          profile: {
            ...current,
            stats: {
              casesSolved,
              winRate,
              totalGames,
              mostUsedSpecialty: current.stats.mostUsedSpecialty,
            },
          },
        });
      },

      clearProfile: () => set({ profile: null, recordedCaseResults: [] }),

      hasProfile: () => get().profile !== null,
      
      ensurePlayerId: () => {
        const current = get().profile;
        if (current && !current.playerId) {
          const playerId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          set({ profile: { ...current, playerId } });
        }
      },
    }),
    {
      name: 'investigation-profile',
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<ProfileState> & {
          profile?: PlayerProfile | null;
          recordedCaseResults?: string[];
        };

        const rawSpecialty = state.profile?.stats?.mostUsedSpecialty ?? '';
        const normalizedSpecialty = VALID_SPECIALTIES.has(rawSpecialty)
          ? rawSpecialty
          : '';

        return {
          ...state,
          recordedCaseResults: Array.isArray(state.recordedCaseResults) ? state.recordedCaseResults : [],
          profile: state.profile
            ? {
                ...state.profile,
                stats: {
                  ...state.profile.stats,
                  mostUsedSpecialty: normalizedSpecialty,
                },
              }
            : state.profile ?? null,
        } satisfies Partial<ProfileState>;
      },
    }
  )
);
