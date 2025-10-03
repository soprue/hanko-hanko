import type { Operation, RoundWithMeta, StitchToken } from '@/types/patterns';

/**
 * 고유 ID 생성기.
 *
 * @remarks
 * 브라우저/노드 모두에서 동작하도록 `crypto.randomUUID()`가 없으면 베이스36 난수를 폴백으로 사용합니다.
 *
 * @returns 새로 생성된 고유 문자열 ID
 * @example
 * const id = uid(); // "k2t8e3s..." 같은 랜덤 문자열
 */
export function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

/**
 * 단일 토큰(스티치)로부터 생성되는 코 수를 계산합니다.
 *
 * @remarks
 * - MR(매직링)은 0코로 간주
 * - 기본코는 1코
 * - 늘림(inc n)은 n코
 * - 줄임(dec n)은 n코를 1코로 모으므로 1코
 * - `times`를 지정하면 동일 토큰을 연속 반복한 것으로 간주하여 곱해집니다.
 *
 * @param token 계산 대상 토큰
 * @returns 해당 토큰이 생성하는 총 코 수
 * @example
 * producedByToken({ base:'SC', arity:null })           // 1
 * producedByToken({ base:'SC', arity:{kind:'inc', n:2}}) // 2
 * producedByToken({ base:'DC', arity:null, times:3 })    // 3
 * producedByToken({ base:'MR', arity:null })             // 0
 */
export function producedByToken(token: StitchToken): number {
  const times = token.times ?? 1;

  if (token.base === 'MR') return 0 * times;

  if (token.arity?.kind === 'inc') return token.arity.n * times;
  if (token.arity?.kind === 'dec') return 1 * times;

  return 1 * times;
}

/**
 * 하나의 오퍼레이션(여러 토큰으로 이루어진 그룹, 그룹 반복 포함)이
 * 생성하는 총 코 수를 계산합니다.
 *
 * @param op 계산 대상 오퍼레이션
 * @returns 해당 오퍼레이션이 생성하는 총 코 수
 * @example
 * // (SC, SC-INC2) × 6  => (1 + 2) × 6 = 18
 * producedByOp({
 *   id:'o1',
 *   tokens:[{id:'t1', base:'SC', arity:null}, {id:'t2', base:'SC', arity:{kind:'inc', n:2}}],
 *   repeat:6
 * }) // 18
 */
export function producedByOp(op: Operation): number {
  const perGroup = op.tokens.reduce(
    (sum, token) => sum + producedByToken(token),
    0,
  );

  return perGroup * (op.repeat ?? 1);
}

/**
 * 한 단(Round)이 생성하는 총 코 수를 계산합니다.
 *
 * @param r 계산 대상 라운드
 * @returns 해당 라운드가 생성하는 총 코 수
 */
export function producedByRound(r: RoundWithMeta): number {
  return r.ops.reduce((sum, op) => sum + producedByOp(op), 0);
}

/**
 * 한 단의 유효성을 검사합니다.
 *
 * @remarks
 * 현재 규칙:
 * 1. MR 사용 위치 — 1단 이외에서 MR 사용 시 경고, 그리고 한 단에서 MR이 2회 이상이면 경고
 * 2. 줄임만 단독 사용 — 줄임(DEC)을 사용하는데 이전 단 정보가 없으면 경고
 * 3. 코 수 불일치 — 늘림/줄임 없이 이전 단 총코와 달라지면 경고
 * 4. 반복값 검사 — `repeat <= 0`이면 경고
 *
 * `prevRound?.totalStitches`를 비교에 사용합니다. 이전 단의 합계가
 * 미리 계산되어 있지 않다면 정확한 비교를 위해 재계산 파이프라인(recalc)을 통해
 * 먼저 합계를 갱신해 두는 것을 권장합니다.
 *
 * @param round 검사 대상 라운드
 * @param prevRound 이전 라운드(없으면 undefined)
 * @returns 경고 메시지 배열(경고가 없으면 빈 배열)
 */
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
    op.tokens.some((token) => token.arity?.kind === 'dec'),
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
  if (
    total !== 0 &&
    !hasInc &&
    !hasDec &&
    prevTotal !== undefined &&
    prevTotal !== total
  )
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

/**
 * 라운드 배열 전체에 대해 파생값을 재계산하고 메타데이터를 갱신합니다.
 *
 * @remarks
 * - 이 함수는 불변성을 지키기 위해 각 라운드를 얕은 복사 후 수정합니다.
 * - 다음 항목을 갱신합니다:
 *   - `totalStitches`: `producedByRound`로 재계산
 *   - `meta.roundIndex`: 배열 인덱스 기반(1부터 시작)
 *   - `meta.warnings`: `validateRound`로 유효성 검사 결과
 *
 * 성능: 라운드 수를 M, 전체 토큰 수를 K라고 할 때 O(M + K).
 *
 * @param rounds 재계산 대상 라운드 배열(원본은 변경하지 않음)
 * @returns 계산/검증이 반영된 새 라운드 배열
 *
 * @example
 * const next = recalc(prevRounds);
 * // 이제 next[i].totalStitches, next[i].meta.warnings를 UI에서 바로 사용 가능
 */
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
