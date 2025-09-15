import { useState, useMemo } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import CheckBox from '@components/ui/CheckBox';
import { useEditorStore } from '@store/editor.store';

type TokenChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
};
function TokenChip({ label, onRemove, className = '' }: TokenChipProps) {
  return (
    <div
      className={
        'border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-1 text-sm ' +
        className
      }
      role='listitem'
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type='button'
          aria-label={`${label} 삭제`}
          className='hover:bg-muted rounded px-1.5 text-xs'
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

type NumberStepperProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};
function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  className = '',
}: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div
      className={
        'inline-flex items-stretch overflow-hidden rounded-md border border-gray-200 bg-white ' +
        className
      }
      role='group'
      aria-label='숫자 스테퍼'
    >
      <button
        type='button'
        className='px-2 text-sm hover:bg-gray-50'
        aria-label='감소'
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <input
        className='w-12 border-x border-gray-200 bg-transparent px-2 text-center text-sm outline-none'
        inputMode='numeric'
        pattern='[0-9]*'
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value || '0', 10);
          if (Number.isNaN(n)) return;
          onChange(clamp(n));
        }}
        aria-live='polite'
      />
      <button
        type='button'
        className='px-2 text-sm hover:bg-gray-50'
        aria-label='증가'
        onClick={() => onChange(clamp(value + step))}
      >
        +
      </button>
    </div>
  );
}

function GroupComposer() {
  const isGrouping = useEditorStore((s) => s.draft.grouping);
  const toggleGrouping = useEditorStore((s) => s.toggleGrouping);

  // 데모용 로컬 상태 (스토어 연동 전까지)
  const [currentToken] = useState(['SC', '기본', '×2']); // 예: 선택된 토큰 표시
  const [groupTokens, setGroupTokens] = useState<string[]>([
    'SC ×2',
    'SC-INC2',
  ]);
  const [repeat, setRepeat] = useState(6);

  const preview = useMemo(() => {
    const body = groupTokens.map((t) => `(${t})`).join(' + ');
    return `[ ${body} ] × ${repeat}`;
  }, [groupTokens, repeat]);

  const handleRemove = (idx: number) =>
    setGroupTokens((arr) => arr.filter((_, i) => i !== idx));

  const handleAddCurrentToGroup = () =>
    setGroupTokens((arr) => [...arr, currentToken.join(' ')]);

  return (
    <div>
      <SectionTitle
        title='그룹 조립'
        right={
          <CheckBox
            label='그룹 사용'
            checked={isGrouping}
            onChange={toggleGrouping}
            size='sm'
          />
        }
      />

      {!isGrouping ? (
        <div className='text-muted-foreground text-xs'>
          그룹 사용을 켜면 조합을 구성할 수 있어요.
        </div>
      ) : (
        <section
          className='border-border flex flex-col gap-4 rounded-lg border border-dashed p-3'
          aria-live='polite'
        >
          {/* 현재 토큰 + 추가 버튼 */}
          <div className='flex items-start justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <p className='font-bold'>현재 토큰:</p>
              <div className='flex items-center gap-2'>
                {currentToken.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
            </div>
            <Button
              size='sm'
              className='px-2 py-1 text-xs'
              variant='ghost'
              onClick={handleAddCurrentToGroup}
            >
              그룹에 추가
            </Button>
          </div>

          {/* 그룹 토큰 리스트 */}
          <div className='text-sm'>
            <p className='font-bold'>그룹 토큰 리스트</p>
            <div className='mt-2 flex flex-wrap items-center gap-2' role='list'>
              {groupTokens.length === 0 ? (
                <span className='text-muted-foreground'>
                  아직 추가된 토큰이 없어요.
                </span>
              ) : (
                groupTokens.map((label, i) => (
                  <TokenChip
                    key={i}
                    label={label}
                    onRemove={() => handleRemove(i)}
                  />
                ))
              )}
            </div>
          </div>

          {/* 그룹 반복 */}
          <div className='flex items-center justify-between text-sm'>
            <p className='font-bold'>그룹 반복</p>
            <NumberStepper
              value={repeat}
              onChange={setRepeat}
              min={1}
              max={99}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default GroupComposer;
