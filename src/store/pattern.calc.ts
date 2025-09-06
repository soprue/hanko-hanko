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
  const mrCount = round.ops.reduce(
    (c, op) => c + op.tokens.filter((token) => token.base === 'MR').length,
    0,
  );

  // MR은 1단에서만 권장
  const idx = round.meta?.roundIndex ?? 0;
  if (usesMR && idx > 1) warns.push('매직링(MR)은 보통 1단에서만 사용합니다.');
  if (mrCount > 1) warns.push('한 단에서 MR이 2번 이상 사용되었습니다.');

  // 줄임(DEC) 사용 시 이전 단 필요
  if (hasDec && !prevRound) warns.push('줄임(DEC)은 이전 단이 필요합니다.');

  // 늘림/줄임이 없는데 코 수 변화가 발생
  if (!hasInc && !hasDec && prevTotal !== undefined && prevTotal !== total)
    warns.push(
      `늘림/줄임 없이 코 수가 ${prevTotal}에서 ${total}으로 변경되었습니다.`,
    );

  // repeat <= 0
  round.ops.forEach((op, i) => {
    if (!Number.isFinite(op.repeat) || op.repeat <= 0)
      warns.push(`[${i + 1}번째 그룹] repeat 값이 1 이상이어야 합니다.`);
  });

  return warns;
}

/** 전체 라운드 계산 */
export function recalc(rounds: RoundWithMeta[]): RoundWithMeta[] {
  return rounds.map((r, i) => {
    const next = { ...r };
    const prev = i > 0 ? rounds[i - 1] : undefined;

    next.totalStitches = producedByRound(next);
    next.meta = {
      ...(next.meta ?? { roundIndex: i + 1 }),
      roundIndex: i + 1,
      warnings: validateRound(next, prev),
    };

    return next;
  });
}
