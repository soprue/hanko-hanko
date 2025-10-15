import { current } from 'immer';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Operation, RoundWithMeta } from '@/types/patterns';
import { recalc, uid } from '@store/pattern.calc';

type PatternState = {
  rounds: RoundWithMeta[];
  selectedRoundId?: string;

  getRoundById: (id: string) => RoundWithMeta | undefined;

  newPattern: () => void;
  setRounds: (rounds: RoundWithMeta[]) => void;

  addRound: () => string;
  removeRound: (roundId: string) => void;
  selectRound: (roundId?: string) => void;

  addOperation: (roundId: string, op: Operation) => void;
  removeOperation: (roundId: string, opId: string) => void;
  updateOperation: (
    roundId: string,
    opId: string,
    patch: Partial<Omit<Operation, 'id'>>,
  ) => void;
  moveOperation: (roundId: string, from: number, to: number) => void;

  // Import/Export
  serialize: () => string; // JSON string
  deserialize: (json: string) => void; // from JSON
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

          updateOperation: (roundId, opId, patch) => {
            set((s) => {
              const base = current(s.rounds);

              const patched = base.map((r) =>
                r.id !== roundId
                  ? r
                  : {
                      ...r,
                      ops: r.ops.map((o) =>
                        o.id === opId ? { ...o, ...patch } : o,
                      ),
                    },
              );

              const next = recalc(patched);

              s.rounds = next;
            });
          },

          moveOperation: (roundId, from, to) => {
            set((s) => {
              const r = s.rounds.find((x) => x.id === roundId);
              if (!r) return;

              const arr = r.ops;
              if (
                from === to ||
                from < 0 ||
                to < 0 ||
                from >= arr.length ||
                to >= arr.length
              )
                return;

              const [moved] = arr.splice(from, 1);
              arr.splice(to, 0, moved);
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
        })),
        { name: 'pattern' },
      ),
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
  );
  return store;
};

export const usePatternStore: PatternStore =
  globalThis.__APP_PATTERN_STORE__ ??
  (globalThis.__APP_PATTERN_STORE__ = createPatternStore());
