import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { RGBA } from '@/types/colorPicker';
import type {
  Arity,
  Operation,
  StitchCode,
  StitchToken,
} from '@/types/patterns';
import { uid } from '@store/pattern.calc';
import { usePatternStore } from '@store/pattern.store';
import { clamp } from '@utils/colorPicker';

type Selection = {
  roundId?: string;
  opId?: string;
  tokenId?: string;
  mode?: 'idle' | 'create' | 'edit';
};

export type Draft = {
  base?: StitchCode; // 선택된 기법
  arity: Arity; // inc, dec, null
  times: number; // 동일 토큰 연속 반복
  grouping: boolean; // 그룹 사용 여부
  repeat: number; // 그룹 반복
  tokens: StitchToken[];
  color?: RGBA;
};

const DEFAULT_SWATCHES: RGBA[] = [
  { r: 255, g: 255, b: 255, a: 1 },
  { r: 0, g: 0, b: 0, a: 1 },
  { r: 248, g: 113, b: 113, a: 1 },
  { r: 251, g: 191, b: 36, a: 1 },
  { r: 52, g: 211, b: 153, a: 1 },
  { r: 96, g: 165, b: 250, a: 1 },
  { r: 167, g: 139, b: 250, a: 1 },
  { r: 244, g: 114, b: 182, a: 1 },
];

export type EditorState = {
  selection: Selection;
  draft: Draft;
  lastColor: RGBA;

  swatches: RGBA[];
  addSwatch: (c?: RGBA) => void;
  clearSwatches: () => void;

  selectOp: (id?: string) => void;

  // draft setters
  setBase: (code: StitchCode) => void;
  setArity: (arity: Arity) => void;
  setTimes: (n: number) => void;
  setGrouping: (v: boolean) => void;
  setRepeat: (n: number) => void;
  setColor: (color: RGBA) => void;

  // draft workflows
  stageCurrentToken: () => void; // base + arity + times -> tokens에 누적
  removeStagedToken: (index: number) => void;
  moveStagedToken: (from: number, to: number) => void;
  clearDraft: () => void;

  beginEdit: (roundId: string, op: Operation) => void;
  cancelEdit: () => void;

  // commit
  commitAsOperation: () => void; // patternStore에 반영
};

const createInitialDraft = (): Draft => ({
  base: 'MR',
  arity: null,
  times: 1,
  grouping: false,
  repeat: 1,
  tokens: [],
  color: { r: 67, g: 151, b: 235, a: 1 },
});

// 유틸: 현재 draft로부터 tokens 빌드
const buildTokensFromDraft = (d: Draft): StitchToken[] => {
  if (d.grouping) return d.tokens.slice(); // 그룹 모드면 누적 토큰 사용
  if (!d.base) return [];
  return [{ id: uid(), base: d.base, arity: d.arity, times: d.times }];
};

// 유틸: Operation을 draft로 적재
const loadDraftFromOperation = (op: Operation): Draft => {
  if (op.tokens.length === 1) {
    const t = op.tokens[0];
    return {
      base: t.base,
      arity: t.arity ?? null,
      times: t.times ?? 1,
      grouping: false,
      repeat: op.repeat ?? 1,
      tokens: [],
      color: op.color,
    };
  }
  // 토큰이 여러 개인 경우 => 그룹 편집
  return {
    base: undefined,
    arity: null,
    times: 1,
    grouping: true,
    repeat: op.repeat ?? 1,
    tokens: op.tokens.map((t) => ({ ...t })), // 복사
    color: op.color,
  };
};

export type EditorStore = UseBoundStore<StoreApi<EditorState>>;

declare global {
  var __APP_EDITOR_STORE__: EditorStore | undefined;
}

const initial = createInitialDraft();

const createEditorStore = (): EditorStore =>
  create<EditorState>()(
    persist(
      devtools(
        immer((set, get) => ({
          selection: { mode: 'create' },
          draft: initial,
          lastColor: initial.color!,
          swatches: DEFAULT_SWATCHES,

          addSwatch: (c) =>
            set(
              (s) => {
                const color = c ?? s.draft.color ?? s.lastColor;
                if (!color) return;
                const key = (x: RGBA) => `${x.r},${x.g},${x.b},${x.a}`;
                const next = [
                  color,
                  ...s.swatches.filter((x) => key(x) !== key(color)),
                ].slice(0, 24);
                s.swatches = next;
              },
              false,
              'editor/addSwatch',
            ),

          clearSwatches: () =>
            set(
              (s) => {
                s.swatches = DEFAULT_SWATCHES;
              },
              false,
              'editor/clearSwatches',
            ),

          selectOp: (id) =>
            set((s) => {
              s.selection.opId = id;
            }),

          setBase: (code) => {
            const curr = get().draft.base;
            if (curr === code) return;
            set(
              (s) => {
                s.draft.base = code;
              },
              false,
              'editor/setBase',
            );
          },

          setArity: (arity) =>
            set((s) => {
              s.draft.arity = arity;
            }),

          setTimes: (n: number) => {
            const clamped = Math.max(1, Math.trunc(n || 1));
            const curr = get().draft.times;
            if (curr === clamped) return;
            set(
              (s) => {
                s.draft.times = clamped;
              },
              false,
              'editor/setTimes',
            );
          },

          setGrouping: (v: boolean) => {
            const next = !!v;
            const curr = get().draft.grouping;
            if (curr === next) return;
            set(
              (s) => {
                s.draft.grouping = next;
                if (!next) s.draft.tokens = [];
              },
              false,
              'editor/setGrouping',
            );
          },

          setRepeat: (n: number) => {
            const clamped = Math.max(1, Math.trunc(n || 1));
            const curr = get().draft.repeat;
            if (curr === clamped) return;
            set(
              (s) => {
                s.draft.repeat = clamped;
              },
              false,
              'editor/setRepeat',
            );
          },

          setColor: (rgba: RGBA) =>
            set(
              (s) => {
                const r = clamp(Math.round(rgba.r), 0, 255);
                const g = clamp(Math.round(rgba.g), 0, 255);
                const b = clamp(Math.round(rgba.b), 0, 255);
                const a = Math.max(0, Math.min(1, rgba.a ?? 1));
                const next = { r, g, b, a };
                s.draft.color = next;
                s.lastColor = next;
              },
              false,
              'editor/setColor',
            ),

          stageCurrentToken: () =>
            set((s) => {
              const { base, arity, times } = s.draft;
              if (!base) return;
              s.draft.tokens.push({ id: uid(), base, arity: arity!, times });
            }),

          removeStagedToken: (index) =>
            set((s) => {
              s.draft.tokens.splice(index, 1);
            }),

          moveStagedToken: (from, to) =>
            set(
              (s) => {
                const arr = s.draft.tokens;
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
              },
              false,
              'editor/moveStagedToken',
            ),

          clearDraft: () =>
            set(
              (s) => {
                s.draft = { ...createInitialDraft(), color: s.lastColor };
              },
              false,
              'editor/clearDraft',
            ),

          beginEdit: (roundId: string, op: Operation) =>
            set((s) => {
              s.selection.roundId = roundId;
              s.selection.opId = op.id;
              s.selection.mode = 'edit';
              s.draft = loadDraftFromOperation(op);
            }),

          cancelEdit: () => {
            set((s) => {
              s.selection.mode = 'create';
              s.selection.opId = undefined;
              s.draft = { ...createInitialDraft(), color: s.lastColor };
            });

            const ps = usePatternStore.getState();
            const lastId = ps.rounds.at(-1)?.id;
            if (lastId) ps.selectRound(lastId);
          },

          commitAsOperation: () => {
            const { draft, selection } = get();
            const ps = usePatternStore.getState();

            const roundId = ps.selectedRoundId;
            if (!roundId) return;

            const tokens = buildTokensFromDraft(draft);
            if (tokens.length === 0) return;

            set((s) => {
              if (draft.color) s.lastColor = draft.color;
            });

            // 편집 모드인 경우: updateOperation
            if (selection.mode === 'edit' && selection.opId) {
              ps.updateOperation(roundId, selection.opId, {
                tokens,
                repeat: draft.repeat,
                color: draft.color!,
              });

              get().cancelEdit();
              const lastId = ps.rounds.at(-1)?.id;
              if (lastId) ps.selectRound(lastId);
              return;
            }

            const op = {
              id: uid(),
              tokens,
              repeat: draft.repeat,
              color: draft.color!,
            };
            ps.addOperation(roundId, op);
            get().clearDraft();
          },
        })),
        { name: 'editor' },
      ),
      {
        name: 'editor',
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({
          swatches: s.swatches,
          lastColor: s.lastColor,
        }),
        onRehydrateStorage: () => (state) => {
          const lc = state?.lastColor;
          if (!lc) return;
          state!.draft = { ...createInitialDraft(), color: lc };
        },
      },
    ),
  );

export const useEditorStore: EditorStore =
  globalThis.__APP_EDITOR_STORE__ ??
  (globalThis.__APP_EDITOR_STORE__ = createEditorStore());
