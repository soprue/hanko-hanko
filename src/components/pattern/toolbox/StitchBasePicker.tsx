import { memo, useCallback } from 'react';

import type { StitchCode } from '@/types/patterns';
import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import { useEditorStore } from '@store/editor.store';

const BASE_STITCHES: Array<{
  code: StitchCode;
  label: string;
  codeText?: string;
}> = [
  { code: 'MR', label: '매직링' },
  { code: 'SC', label: '짧은뜨기' },
  { code: 'DC', label: '긴뜨기' },
  { code: 'CH', label: '사슬뜨기' },
  { code: 'HDC', label: '한길긴뜨기' },
  { code: 'SLST', label: '빼뜨기', codeText: 'SL ST' }, // 표시용 공백 처리
];

const StitchItem = memo(function StitchItem({
  code,
  label,
  selected,
  onClick,
  codeText,
}: {
  code: StitchCode;
  label: string;
  codeText?: string;
  selected: boolean;
  onClick: (c: StitchCode) => void;
}) {
  const handleClick = useCallback(() => onClick(code), [onClick, code]);

  return (
    <Button
      variant={selected ? 'default' : 'ghost'}
      className='flex flex-col items-center gap-1.5 text-sm'
      onClick={handleClick}
      aria-label={`${label} 선택 (${code})`}
    >
      <p className='font-bold'>{codeText ?? code}</p>
      <span className='font-light'>{label}</span>
    </Button>
  );
});

function StitchBasePicker() {
  const selectedBase = useEditorStore((s) => s.draft.base);
  const pickBase = useEditorStore((s) => s.pickBase);

  const handleSelect = useCallback(
    (c: StitchCode) => {
      pickBase(c);
    },
    [pickBase],
  );

  return (
    <div>
      <SectionTitle title='기법 선택' />

      <div className='grid grid-cols-3 gap-2'>
        {BASE_STITCHES.map((s) => (
          <StitchItem
            key={s.code}
            code={s.code}
            codeText={s.codeText}
            label={s.label}
            selected={selectedBase === s.code}
            onClick={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default StitchBasePicker;
