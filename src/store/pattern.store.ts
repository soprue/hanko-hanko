import * as Sentry from '@sentry/react';
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
            try {
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
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'newPattern' },
              });
              console.error('Failed to create new pattern:', error);
            }
          },

          setRounds: (rounds) => {
            try {
              set((s) => {
                s.rounds = recalc(rounds);
                s.selectedRoundId = s.rounds[0]?.id;
              });
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'setRounds', roundsCount: rounds?.length },
              });
              console.error('Failed to set rounds:', error);
            }
          },

          addRound: () => {
            try {
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
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'addRound' },
              });
              console.error('Failed to add round:', error);
              return uid(); // Fallback: 최소한 ID는 반환
            }
          },

          removeRound: (roundId) => {
            try {
              set((s) => {
                const idx = s.rounds.findIndex((r) => r.id === roundId);
                s.rounds = s.rounds.filter((r) => r.id !== roundId);
                s.rounds = recalc(s.rounds);

                if (s.selectedRoundId === roundId) {
                  const nextIdx = Math.max(
                    0,
                    Math.min(idx, s.rounds.length - 1),
                  );
                  s.selectedRoundId = s.rounds[nextIdx]?.id;
                }
              });
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'removeRound', roundId },
              });
              console.error('Failed to remove round:', error);
            }
          },

          selectRound: (roundId) => {
            set((s) => {
              s.selectedRoundId = roundId;
            });
          },

          addOperation: (roundId, op) => {
            try {
              set((s) => {
                const round = s.rounds.find((r) => r.id === roundId);
                if (!round) return;
                round.ops.push(op);
                s.rounds = recalc(s.rounds);
              });
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'addOperation', roundId, opId: op?.id },
              });
              console.error('Failed to add operation:', error);
            }
          },

          removeOperation: (roundId, opId) => {
            try {
              set((s) => {
                const round = s.rounds.find((r) => r.id === roundId);
                if (!round) return;
                round.ops = round.ops.filter((o) => o.id !== opId);
                s.rounds = recalc(s.rounds);
              });
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'removeOperation', roundId, opId },
              });
              console.error('Failed to remove operation:', error);
            }
          },

          updateOperation: (roundId, opId, patch) => {
            try {
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
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'updateOperation', roundId, opId, patch },
              });
              console.error('Failed to update operation:', error);
            }
          },

          moveOperation: (roundId, from, to) => {
            try {
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
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'moveOperation', roundId, from, to },
              });
              console.error('Failed to move operation:', error);
            }
          },

          serialize: () => {
            try {
              const data = { rounds: get().rounds };
              return JSON.stringify(data);
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: {
                  function: 'serialize',
                  roundsCount: get().rounds?.length,
                },
              });
              console.error('Failed to serialize pattern:', error);
              return '{}'; // Fallback: 빈 객체 반환
            }
          },

          deserialize: (json) => {
            try {
              const parsed = JSON.parse(json) as { rounds: RoundWithMeta[] };
              get().setRounds(parsed.rounds ?? []);
            } catch (error) {
              Sentry.captureException(error, {
                tags: { module: 'PatternValidation' },
                extra: { function: 'deserialize', jsonLength: json?.length },
              });
              console.error('Failed to deserialize pattern:', error);
              // Fallback: 빈 패턴으로 초기화하지 않고 에러만 로깅
            }
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
