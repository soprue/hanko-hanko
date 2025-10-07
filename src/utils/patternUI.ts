import type { Draft } from '@/store/editor.store';
import type { Arity, Operation, Round, StitchToken } from '@/types/patterns';

// '변형' 컴팩트 표기: -INC2 / -DEC3 / ''
export function aritySuffix(arity: Arity): string {
  if (!arity) return '';
  return arity.kind === 'inc' ? `-INC${arity.n}` : `-DEC${arity.n}`;
}

// 토큰 라벨 컴팩트 표기: SC-INC2 ×3
export function tokenLabelCompact(t: StitchToken): string {
  const tx = t.times && t.times > 1 ? ` ×${t.times}` : '';
  return `${t.base}${aritySuffix(t.arity)}${tx}`;
}

// '변형' 한글 UI 표기: 기본 / 늘림(2코) / 줄임(3코)
export function arityHuman(arity: Arity): string {
  if (!arity) return '기본';
  return arity.kind === 'inc' ? `늘림(${arity.n}코)` : `줄임(${arity.n}코)`;
}

// '기법' 한글 UI 표기: SC + 기본 / SC + 늘림(2코) + ×3
export function tokenLabelHuman(t: StitchToken): string {
  const parts = [t.base, arityHuman(t.arity)];
  if ((t.times ?? 1) > 1) parts.push(`×${t.times}`);
  return parts.join(' + ');
}

export function stringifyOperation(op: Operation): string {
  const inner = op.tokens.map(tokenLabelCompact).join(', ');
  const needsParen = op.tokens.length > 1;
  const group = needsParen ? `(${inner})` : inner;
  const rep = op.repeat && op.repeat > 1 ? ` ×${op.repeat}` : '';
  return `${group}${rep}`;
}

export function stringifyRound(r: Round, sep: string = '; '): string {
  return r.ops.map(stringifyOperation).join(sep);
}

export function draftToOperation(d: Draft): Operation | null {
  if (d.grouping) {
    if (!d.tokens || d.tokens.length === 0) return null;
    return {
      id: 'op-prev',
      tokens: d.tokens,
      repeat: Math.max(1, d.repeat || 1),
      color: d.color!,
    };
  }

  // 비그룹 모드: 단일 토큰. repeat은 보기 좋게 times에 흡수
  if (!d.base) return null;
  const times = Math.max(1, (d.times || 1) * Math.max(1, d.repeat || 1));
  const token: StitchToken = {
    id: 'tmp-1',
    base: d.base,
    arity: d.arity,
    times,
  };
  return { id: 'op-prev', tokens: [token], repeat: 1, color: d.color! };
}

export function draftToString(d: Draft): string {
  const op = draftToOperation(d);
  return op ? stringifyOperation(op) : '';
}
