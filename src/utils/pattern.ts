import type { Arity, StitchToken } from '@/types/patterns';

export function tokenLabel(t: StitchToken) {
  const ar = t.arity
    ? t.arity.kind === 'inc'
      ? `-INC${t.arity.n}`
      : `-DEC${t.arity.n}`
    : '';
  const tx = t.times && t.times > 1 ? ` ×${t.times}` : '';
  return `${t.base}${ar}${tx}`;
}

export function formatArity(arity: Arity) {
  if (!arity) return '기본';
  return arity.kind === 'inc' ? `늘림(${arity.n}코)` : `줄임(${arity.n}코)`;
}

export function formatCurrent(base?: string, arity?: Arity, times?: number) {
  if (!base) return '—';
  const parts = [base, formatArity(arity!)];
  if ((times ?? 1) > 1) parts.push(`×${times}`);
  return parts.join(' + ');
}
