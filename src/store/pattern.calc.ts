import type { Operation, RoundWithMeta, StitchToken } from '@/types/patterns';

/** 브라우저/노드 모두에서 안전하게 id 생성 */
export function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

/** 토큰 1개의 “생성 코 수” 계산
 *  - MR: 0
 *  - 기본코: 1
 *  - INC(n): n
 *  - DEC(n): 1 (n코 모아뜨기 → 1코 생성)
 *  - times: 동일 토큰 연속 반복
 */
export function producedByToken(token: StitchToken): number {
  const times = token.times ?? 1;

  if (token.base === 'MR') return 0 * times;

  if (token.arity?.kind === 'inc') return token.arity.n * times;
  if (token.arity?.kind === 'dec') return 1 * times;

  return 1 * times;
}

/** 하나의 Operation이 생성하는 총 코 수 */
export function producedByOp(op: Operation): number {
  const perGroup = op.tokens.reduce(
    (sum, token) => sum + producedByToken(token),
    0,
  );

  return perGroup * (op.repeat ?? 1);
}

/** 한 단이 생성하는 총 코 수 */
export function producedByRound(r: RoundWithMeta): number {
  return r.ops.reduce((sum, op) => sum + producedByOp(op), 0);
}

/** 유효성 검증 규칙 */
export function validateRound(
  round: RoundWithMeta,
  prevRound?: RoundWithMeta,
): string[] {
  const warns: string[] = [];
  const total = producedByRound(round);
  const prevTotal = prevRound?.totalStitches;

  const hasInc = round.ops.some((op) =>
    op.tokens.some((token) => token.arity?.kind === 'inc'),
  );
  const hasDec = round.ops.some((op) =>
    op.tokens.some((token) => token.arity?.kind === 'inc'),
  );
  const usesMR = round.ops.some((op) =>
    op.tokens.some((token) => token.base === 'MR'),
  );

  return warns;
}
