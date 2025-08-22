import type { Operation, StitchToken } from '@/types/patterns';

type PatternListItemProps = {
  item: Operation;
};

function PatternListItem({ item }: PatternListItemProps) {
  const tokenLabel = (t: StitchToken) => {
    const arity =
      t.arity == null
        ? ''
        : t.arity.kind === 'inc'
          ? `-INC${t.arity.n}`
          : `-DEC${t.arity.n}`;
    const times = t.times && t.times > 1 ? ` ×${t.times}` : '';
    return `${t.base}${arity}${times}`;
  };

  const opLabel = (op: Operation) => {
    const group =
      op.tokens.length === 1
        ? tokenLabel(op.tokens[0])
        : `(${op.tokens.map(tokenLabel).join(', ')})`;
    return op.repeat > 1 ? `${group} ×${op.repeat}` : group;
  };

  return (
    <div className='border-border rounded-xl border px-5 py-2'>
      {opLabel(item)}
    </div>
  );
}

export default PatternListItem;
