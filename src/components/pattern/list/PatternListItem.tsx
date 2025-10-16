import type { Operation } from '@/types/patterns';
import Icon from '@components/ui/Icon';
import { useEditorStore } from '@store/editor.store';
import { useGlobalModalStore } from '@store/modal.store';
import { usePatternStore } from '@store/pattern.store';
import { cn } from '@utils/cn';
import { rgbaToHex } from '@utils/colorPicker';
import { tokenLabelCompact } from '@utils/patternUI';

type PatternListItemProps = {
  roundId: string;
  item: Operation;
  warning?: string[];
};

function PatternListItem({ roundId, item, warning }: PatternListItemProps) {
  const openModal = useGlobalModalStore((s) => s.openModal);
  const closeModal = useGlobalModalStore((s) => s.closeModal);
  const beginEdit = useEditorStore((s) => s.beginEdit);
  const selectRound = usePatternStore((s) => s.selectRound);
  const removeOperation = usePatternStore((s) => s.removeOperation);

  const opLabel = (op: Operation) => {
    const group =
      op.tokens.length === 1
        ? tokenLabelCompact(op.tokens[0])
        : `(${op.tokens.map(tokenLabelCompact).join(', ')})`;
    return op.repeat > 1 ? `${group} ×${op.repeat}` : group;
  };

  const color = rgbaToHex(item.color);

  const handleEdit = () => {
    selectRound(roundId);
    beginEdit(roundId, item);
  };

  const handleDelete = () => {
    openModal({
      title: '정말 삭제할까요?',
      children: '이 작업은 되돌릴 수 없어요.',
      confirmText: '삭제',
      onCancel: closeModal,
      onConfirm: () => {
        removeOperation(roundId, item.id);
        closeModal();
      },
    });
  };

  return (
    <div
      className={cn(
        warning?.length !== 0 && 'border-warning',
        'border-border flex items-center justify-between rounded-xl border px-5 py-2',
      )}
    >
      <div className='flex items-center gap-3 text-sm'>
        <div
          className='size-3.5 rounded-full'
          style={{ backgroundColor: color }}
        />
        <p>{opLabel(item)}</p>
      </div>
      <div className='flex items-center gap-2'>
        <button className='cursor-pointer' onClick={handleEdit}>
          <Icon name='Edit' width={14} color='#333' />
        </button>
        <button className='cursor-pointer' onClick={handleDelete}>
          <Icon name='Trash' width={16} color='#333' />
        </button>
      </div>
    </div>
  );
}

export default PatternListItem;
