import { useRef } from 'react';

import { useDrag, useDrop, type XYCoord } from 'react-dnd';

import { cn } from '@utils/cn';

const ITEM_TYEPS = {
  OP: 'OPERATION',
};

type SortableOperationProps = {
  id: string;
  index: number;
  roundId: string; // 같은 라운드끼리만 이동 허용
  onMove: (from: number, to: number) => void;
  children: React.ReactNode;
};

type DragItem = {
  type: typeof ITEM_TYEPS.OP;
  id: string;
  index: number;
  roundId: string;
};

function SortableOperation({
  id,
  index,
  roundId,
  onMove,
  children,
}: SortableOperationProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop<DragItem>({
    accept: ITEM_TYEPS.OP,
    hover(item, monitor) {
      if (!ref.current) return;
      if (item.roundId !== roundId) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset() as XYCoord;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYEPS.OP,
    item: (): DragItem => ({
      type: ITEM_TYEPS.OP,
      id,
      index,
      roundId,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn('cursor-grab select-none', isDragging && 'opacity-50')}
      role='listitem'
    >
      {children}
    </div>
  );
}

export default SortableOperation;
