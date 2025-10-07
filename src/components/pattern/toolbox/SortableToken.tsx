import { memo, useRef } from 'react';

import { useDrag, useDrop, type DropTargetMonitor } from 'react-dnd';

import { cn } from '@utils/cn';

const DND_TYPES = {
  TOKEN: 'TOKEN',
} as const;

type DragItem = {
  type: typeof DND_TYPES.TOKEN;
  id: string;
  index: number;
};

type SortableTokenProps = {
  id: string;
  index: number;
  label: string;
  onRemove?: () => void;
  onMove?: (from: number, to: number) => void;
  className?: string;
};

const SortableToken = memo(function SortableToken({
  id,
  index,
  label,
  onRemove,
  onMove,
  className = '',
}: SortableTokenProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop<DragItem>({
    accept: DND_TYPES.TOKEN,
    hover(item, monitor: DropTargetMonitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // 마우스 위치 기준으로 절반 지나면 스왑
      const hoverBoundIngRect = ref.current.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundIngRect.right - hoverBoundIngRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBoundIngRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      onMove?.(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.TOKEN,
    item: {
      type: DND_TYPES.TOKEN,
      id,
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      role='listitem'
      className={cn(
        'border-border bg-background flex cursor-grab items-center gap-2 rounded-lg border px-3 py-1 text-sm',
        className,
        isDragging && 'opacity-50',
      )}
    >
      <span aria-hidden className='select-none'>
        ≡
      </span>
      <span>{label}</span>
      {onRemove && (
        <button
          type='button'
          aria-label={`${label} 삭제`}
          className='hover:bg-muted cursor-pointer rounded pl-1.5 text-xs'
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
});

export default SortableToken;
