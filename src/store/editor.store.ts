import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Arity, StitchCode, StitchToken } from '@/types/patterns';
import { uid } from '@store/pattern.calc';
import { usePatternStore } from '@store/pattern.store';

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

type EditorState = {
  selection: Selection;
  draft: Draft;

  // selection
  selectRound: (id?: string) => void;
  selectOp: (id?: string) => void;
  selectToken: (id?: string) => void;

  // draft setters
  pickBase: (code: StitchCode) => void;
  setArity: (arity: Arity) => void;
  setTimes: (n: number) => void;
  toggleGrouping: () => void;
  setRepeat: (n: number) => void;

  // draft workflows
  stageCurrentToken: () => void; // base + arity + times -> tokens에 누적
  clearDraft: () => void;

  // commit
  commitAsOperation: () => void; // patternStore에 반영
};

const initialDraft: Draft = {
  base: undefined,
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

      pickBase: (code) =>
        set((s) => {
          s.draft.base = code;
        }),
      setArity: (arity) =>
        set((s) => {
          s.draft.arity = arity;
        }),
      setTimes: (n) =>
        set((s) => {
          s.draft.times = Math.max(1, Math.trunc(n || 1));
        }),
      toggleGrouping: () =>
        set((s) => {
          s.draft.grouping = !s.draft.grouping;
          if (!s.draft.grouping) s.draft.tokens = []; // 그룹 해제 시 누적 초기화
        }),
      setRepeat: (n) =>
        set((s) => {
          s.draft.repeat = Math.max(1, Math.trunc(n || 1));
        }),

      stageCurrentToken: () =>
        set((s) => {
          const { base, arity, times } = s.draft;
          if (!base) return;
          s.draft.tokens.push({ id: uid(), base, arity: arity!, times });
        }),

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
