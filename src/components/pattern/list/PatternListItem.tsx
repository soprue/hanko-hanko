import type { Operation } from '@/types/patterns';
import { tokenLabelCompact } from '@utils/patternUI';

type PatternListItemProps = {
  item: Operation;
};

function PatternListItem({ item }: PatternListItemProps) {
  const opLabel = (op: Operation) => {
    const group =
      op.tokens.length === 1
        ? tokenLabelCompact(op.tokens[0])
        : `(${op.tokens.map(tokenLabelCompact).join(', ')})`;
    return op.repeat > 1 ? `${group} ×${op.repeat}` : group;
  };

  return (
    <div className='border-border rounded-xl border px-5 py-2'>
      {opLabel(item)}
    </div>
  );
}

export default PatternListItem;
