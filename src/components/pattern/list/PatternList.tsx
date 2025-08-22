import type { RoundWithMeta } from '@/types/patterns';
import PatternListItem from '@components/pattern/list/PatternListItem';

const roundsMock: RoundWithMeta[] = [
  // [1단] MR, SC×6 → 총 6코
  {
    id: 'r1',
    ops: [
      {
        id: 'r1-o1',
        tokens: [{ id: 'r1-o1-t1', base: 'MR', arity: null }],
        repeat: 1,
      },
      {
        id: 'r1-o2',
        tokens: [{ id: 'r1-o2-t1', base: 'SC', arity: null, times: 6 }],
        repeat: 1,
      },
    ],
    totalStitches: 6,
    meta: { roundIndex: 1 },
  },

  // [2단] SC-INC2×6 → 총 12코 (단일 코 반복 → times)
  {
    id: 'r2',
    ops: [
      {
        id: 'r2-o1',
        tokens: [
          {
            id: 'r2-o1-t1',
            base: 'SC',
            arity: { kind: 'inc', n: 2 },
            times: 6,
          },
        ],
        repeat: 1,
      },
    ],
    totalStitches: 12,
    meta: { roundIndex: 2 },
  },

  // [3단] (SC, SC-INC2) ×6 → (1+2)=3 ×6 = 18코 (그룹 반복 → repeat)
  {
    id: 'r3',
    ops: [
      {
        id: 'r3-o1',
        tokens: [
          { id: 'r3-o1-t1', base: 'SC', arity: null, times: 1 },
          {
            id: 'r3-o1-t2',
            base: 'SC',
            arity: { kind: 'inc', n: 2 },
            times: 1,
          },
        ],
        repeat: 6,
      },
    ],
    totalStitches: 18,
    meta: { roundIndex: 3 },
  },

  // [4단] SC×19 → 총 19코 (의도된 경고 예시)
  {
    id: 'r4',
    ops: [
      {
        id: 'r4-o1',
        tokens: [{ id: 'r4-o1-t1', base: 'SC', arity: null, times: 19 }],
        repeat: 1,
      },
    ],
    totalStitches: 19,
    meta: {
      roundIndex: 4,
    },
  },
  // [1단] MR, SC×6 → 총 6코
  {
    id: 'r1',
    ops: [
      {
        id: 'r1-o1',
        tokens: [{ id: 'r1-o1-t1', base: 'MR', arity: null }],
        repeat: 1,
      },
      {
        id: 'r1-o2',
        tokens: [{ id: 'r1-o2-t1', base: 'SC', arity: null, times: 6 }],
        repeat: 1,
      },
    ],
    totalStitches: 6,
    meta: { roundIndex: 1 },
  },

  // [2단] SC-INC2×6 → 총 12코 (단일 코 반복 → times)
  {
    id: 'r2',
    ops: [
      {
        id: 'r2-o1',
        tokens: [
          {
            id: 'r2-o1-t1',
            base: 'SC',
            arity: { kind: 'inc', n: 2 },
            times: 6,
          },
        ],
        repeat: 1,
      },
    ],
    totalStitches: 12,
    meta: { roundIndex: 2 },
  },

  // [3단] (SC, SC-INC2) ×6 → (1+2)=3 ×6 = 18코 (그룹 반복 → repeat)
  {
    id: 'r3',
    ops: [
      {
        id: 'r3-o1',
        tokens: [
          { id: 'r3-o1-t1', base: 'SC', arity: null, times: 1 },
          {
            id: 'r3-o1-t2',
            base: 'SC',
            arity: { kind: 'inc', n: 2 },
            times: 1,
          },
        ],
        repeat: 6,
      },
    ],
    totalStitches: 18,
    meta: { roundIndex: 3 },
  },

  // [4단] SC×19 → 총 19코 (의도된 경고 예시)
  {
    id: 'r4',
    ops: [
      {
        id: 'r4-o1',
        tokens: [{ id: 'r4-o1-t1', base: 'SC', arity: null, times: 19 }],
        repeat: 1,
      },
    ],
    totalStitches: 19,
    meta: {
      roundIndex: 4,
    },
  },
];

function PatternList() {
  return (
    <div className='flex flex-auto flex-col gap-8'>
      {roundsMock.map((rounds) => {
        const roundTitle = rounds.meta?.roundIndex
          ? `[${rounds.meta.roundIndex}단]`
          : '';
        const roundTotal =
          rounds.totalStitches != null ? `총 ${rounds.totalStitches}코` : '';

        return (
          <div>
            <div className='mb-3 text-sm'>
              <span className='font-bold'>{roundTitle}</span> - {roundTotal}
            </div>

            <div className='flex flex-col gap-2'>
              {rounds.ops.map((op) => {
                return <PatternListItem item={op} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PatternList;
