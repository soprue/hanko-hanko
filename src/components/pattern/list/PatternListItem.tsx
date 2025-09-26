import Icon from '@/components/ui/Icon';
import type { Operation } from '@/types/patterns';
import { rgbaToHex } from '@/utils/colorPicker';
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

  const color = rgbaToHex(item.color);

  return (
    <div className='border-border flex items-center justify-between rounded-xl border px-5 py-2'>
      <div className='flex items-center gap-3 text-sm'>
        <div
          className='size-3.5 rounded-full'
          style={{ backgroundColor: color }}
        />
        <p>{opLabel(item)}</p>
      </div>
      <div className='flex items-center gap-2'>
        <button className='cursor-pointer'>
          <Icon name='Edit' width={14} color='#333' />
        </button>
        <button className='cursor-pointer'>
          <Icon name='Trash' width={16} color='#333' />
        </button>
      </div>
    </div>
  );
}

export default PatternListItem;
