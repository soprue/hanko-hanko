// 기본 코(늘림/줄임의 대상)
type BaseStitch = 'MR' | 'CH' | 'SC' | 'HDC' | 'DC' | 'TR' | 'SLST';

// 가변도(늘림/줄임)
type Arity =
  | { kind: 'inc'; n: 2 | 3 | 4 } // 예: INC2(한 코에 2개 뜸)
  | { kind: 'dec'; n: 2 | 3 | 4 } // 예: DEC3(3코 모아뜨기)
  | null;

// 토큰: "SC-INC2", "DC-DEC3", "SC"(그냥 기본코)
type StitchToken = {
  id: string;
  base: BaseStitch;
  arity: Arity; // null이면 그냥 기본코
  times?: number; // 같은 토큰을 연속 몇 번(옵션)  ex) SC * 6
};

// 동작: 토큰들을 하나의 묶음으로, 그룹 반복 가능
// (SC, SC-INC2) × 6 같은 표현을 위해
type Operation = {
  id: string;
  tokens: StitchToken[];
  repeat: number;
};

// 단
type Round = {
  id: string;
  ops: Operation[];
  totalStitches?: number;
};

/* 사용 예시 */

/*
times: 같은 코 하나를 연속으로 반복할 때. 예) SC × 12
repeat: 여러 코를 그룹으로 묶은 패턴을 통째로 반복할 때. 예) (SC, SC-INC2) × 6

A) MR, SC ×6 → 총 6코
const Round1: Round = {
  id: 'r1',
  ops: [
    { id: 'o1', tokens: [{ id: 't1', base: 'MR', arity: null }], repeat: 1 }, // 0→0
    { id: 'o2', tokens: [{ id: 't2', base: 'SC', arity: null, times: 1 }], repeat: 6 } // 1→1 ×6
  ],
  totalStitches: 6
};

B) SC-INC2 ×6 → 총 12코
const Round2: Round = {
  id: 'r2',
  ops: [
    { id: 'o1', tokens: [{ id: 't1', base: 'SC', arity: { kind: 'inc', n: 2 } }], repeat: 6 } // 1→2 ×6
  ],
  totalStitches: 12
};

C) (SC, SC-INC2) ×6 → (1+2)=3 ×6 = 18코
const Round3: Round = {
  id: 'r3',
  ops: [
    {
      id: 'o1',
      tokens: [
        { id: 't1', base: 'SC', arity: null },                 // 1→1
        { id: 't2', base: 'SC', arity: { kind: 'inc', n: 2 } } // 1→2
      ],
      repeat: 6
    }
  ],
  totalStitches: 18
};
*/
