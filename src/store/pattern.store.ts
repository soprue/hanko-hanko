import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Operation, RoundWithMeta, StitchToken } from '@/types/patterns';
import { recalc, uid } from '@store/pattern.calc';

type PatternState = {
  rounds: RoundWithMeta[];
  selectedRoundId?: string;

  getRoundById: (id: string) => RoundWithMeta | undefined;

  newPattern: () => void;
  setRounds: (rounds: RoundWithMeta[]) => void;

  addRound: () => string; // returns new round Id
  removeRound: (roundId: string) => void;
  selectRound: (roundId?: string) => void;

  addOperation: (roundId: string, op: Operation) => void;
  removeOperation: (roundId: string, opId: string) => void;

  addToken: (roundId: string, opId: string, token: StitchToken) => void;
  removeToken: (roundId: string, opId: string, tokenIndex: number) => void;
  updateToken: (
    roundId: string,
    opId: string,
    tokenIndex: number,
    patch: Partial<StitchToken>,
  ) => void;

  // Import/Export
  serialize: () => string; // JSON string
  deserialize: (json: string) => void; // from JSON

  // 편의 유틸
  bumpAll: () => void; // 합계/경고 재계산만 강제
};

type WithPersist<T> = T & {
  persist: {
    hasHydrated: () => boolean;
    onHydrate: (fn: (state: PatternState) => void) => () => void;
    onFinishHydration: (fn: (state: PatternState) => void) => () => void;
    // Add other persist methods if needed
  };
};

export type PatternStore = UseBoundStore<WithPersist<StoreApi<PatternState>>>;

declare global {
  var __APP_PATTERN_STORE__: PatternStore | undefined;
}

const createPatternStore = (): PatternStore => {
  const store = create<PatternState>()(
    devtools(
      persist(
        immer<PatternState>((set, get) => ({
          rounds: [],
          selectedRoundId: undefined,

          getRoundById: (id) => get().rounds.find((r) => r.id === id),

          newPattern: () => {
            set((s) => {
              const id = uid();
              s.rounds = [
                {
                  id,
                  ops: [],
                  meta: { roundIndex: 1 },
                },
              ];
              s.rounds = recalc(s.rounds);
              s.selectedRoundId = id;
            });
          },

          setRounds: (rounds) => {
            set((s) => {
              s.rounds = recalc(rounds);
              s.selectedRoundId = s.rounds[0]?.id;
            });
          },

          addRound: () => {
            const id = uid();
            set((s) => {
              const next: RoundWithMeta = {
                id,
                ops: [],
                meta: { roundIndex: s.rounds.length + 1 },
              };
              s.rounds.push(next);
              s.rounds = recalc(s.rounds);
              s.selectedRoundId = next.id;
            });
            return id;
          },

          removeRound: (roundId) => {
            set((s) => {
              s.rounds = s.rounds.filter((r) => r.id !== roundId);
              s.rounds = recalc(s.rounds);
              if (s.selectedRoundId === roundId) {
                s.selectedRoundId = s.rounds.at(-1)?.id;
              }
            });
          },

          selectRound: (roundId) => {
            set((s) => {
              s.selectedRoundId = roundId;
            });
          },

          addOperation: (roundId, op) => {
            set((s) => {
              const round = s.rounds.find((r) => r.id === roundId);
              if (!round) return;
              round.ops.push(op);
              s.rounds = recalc(s.rounds);
            });
          },

          removeOperation: (roundId, opId) => {
            set((s) => {
              const round = s.rounds.find((r) => r.id === roundId);
              if (!round) return;
              round.ops = round.ops.filter((o) => o.id !== opId);
              s.rounds = recalc(s.rounds);
            });
          },

          addToken: (roundId, opId, token) => {
            set((s) => {
              const round = s.rounds.find((r) => r.id === roundId);
              if (!round) return;
              const op = round.ops.find((o) => o.id === opId);
              if (!op) return;
              op.tokens.push(token);
              s.rounds = recalc(s.rounds);
            });
          },

          removeToken: (roundId, opId, tokenIndex) => {
            set((s) => {
              const round = s.rounds.find((r) => r.id === roundId);
              if (!round) return;
              const op = round.ops.find((o) => o.id === opId);
              if (!op) return;
              op.tokens = op.tokens.filter((_, i) => i !== tokenIndex);
              s.rounds = recalc(s.rounds);
            });
          },

          updateToken: (roundId, opId, tokenIndex, patch) => {
            set((s) => {
              const round = s.rounds.find((r) => r.id === roundId);
              if (!round) return;
              const op = round.ops.find((o) => o.id === opId);
              if (!op) return;
              const token = op.tokens[tokenIndex];
              if (!token) return;
              Object.assign(token, patch);
              s.rounds = recalc(s.rounds);
            });
          },

          serialize: () => {
            const data = { rounds: get().rounds };
            return JSON.stringify(data);
          },

          deserialize: (json) => {
            const parsed = JSON.parse(json) as { rounds: RoundWithMeta[] };
            get().setRounds(parsed.rounds ?? []);
          },

          bumpAll: () => {
            set((s) => {
              s.rounds = recalc(s.rounds);
            });
          },
        })),
        {
          name: 'pattern',
          storage: createJSONStorage(() => localStorage),
          onRehydrateStorage: () => () => {
            const st = store.getState();
            if (!st.rounds.length) {
              const id = st.addRound();
              st.selectRound(id);
            } else if (!st.selectedRoundId) {
              st.selectRound(st.rounds[0].id);
            }
          },
        },
      ),
      { name: 'pattern' },
    ),
  );
  return store;
};

export const usePatternStore: PatternStore =
  globalThis.__APP_PATTERN_STORE__ ??
  (globalThis.__APP_PATTERN_STORE__ = createPatternStore());
