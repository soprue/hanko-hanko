import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Arity, StitchCode, StitchToken } from '@/types/patterns';
import { uid } from '@store/pattern.calc';
import { usePatternStore } from '@store/pattern.store';
import { produce } from 'immer';

type Selection = {
  roundId?: string;
  opId?: string;
  tokenId?: string;
};

type Draft = {
  base?: StitchCode; // 선택된 기법
  arity: Arity; // inc, dec, null
  times: number; // 동일 토큰 연속 반복
  grouping: boolean; // 그룹 사용 여부
  repeat: number; // 그룹 반복
  tokens: StitchToken[]; // grouping이 true일 때만 사용
};

export type EditorState = {
  selection: Selection;
  draft: Draft;

  // selection
  selectRound: (id?: string) => void;
  selectOp: (id?: string) => void;
  selectToken: (id?: string) => void;

  // draft setters
  setBase: (code: StitchCode) => void;
  setArity: (arity: Arity) => void;
  setTimes: (n: number) => void;
  setGrouping: (v: boolean) => void;
  setRepeat: (n: number) => void;

  // draft workflows
  stageCurrentToken: () => void; // base + arity + times -> tokens에 누적
  removeStagedToken: (index: number) => void;
  moveStagedToken: (from: number, to: number) => void;
  clearDraft: () => void;

  // commit
  commitAsOperation: () => void; // patternStore에 반영
};

const initialDraft: Draft = {
  base: 'MR',
  arity: null,
  times: 1,
  grouping: false,
  repeat: 1,
  tokens: [],
};

export const useEditorStore = create<EditorState>()(
  devtools(
    immer((set, get) => ({
      selection: {},
      draft: initialDraft,

      selectRound: (id) =>
        set((s) => {
          s.selection.roundId = id;
        }),
      selectOp: (id) =>
        set((s) => {
          s.selection.opId = id;
        }),
      selectToken: (id) =>
        set((s) => {
          s.selection.tokenId = id;
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
          produce<EditorState>((s) => {
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
          }),
        ),

      clearDraft: () =>
        set((s) => {
          s.draft = initialDraft;
        }),

      commitAsOperation: () => {
        const { selection, draft } = get();
        const roundId = selection.roundId;
        if (!roundId) return;

        // 그룹 사용 여부에 따라 tokens 빌드
        let tokens: StitchToken[] = [];
        if (draft.grouping) {
          tokens = draft.tokens.length
            ? draft.tokens
            : draft.base
              ? [
                  {
                    id: uid(),
                    base: draft.base,
                    arity: draft.arity,
                    times: draft.times,
                  },
                ]
              : [];
        } else if (draft.base) {
          tokens = [
            {
              id: uid(),
              base: draft.base,
              arity: draft.arity,
              times: draft.times,
            },
          ];
        }

        if (tokens.length === 0) return;

        const op = { id: uid(), tokens, repeat: draft.repeat };
        usePatternStore.getState().addOperation(roundId, op); // 패턴에 반영
        get().clearDraft();
      },
    })),
    { name: 'editor' },
  ),
);
