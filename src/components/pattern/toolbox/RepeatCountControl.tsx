import { useEffect, useState } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import { useEditorStore } from '@store/editor.store';

function RepeatCountControl() {
  const selectedBase = useEditorStore((s) => s.draft.base);
  const count = useEditorStore((s) => s.draft.times);
  const setCount = useEditorStore((s) => s.setTimes);

  const [inputValue, setInputValue] = useState(String(count));

  useEffect(() => {
    setInputValue(String(count));
  }, [count]);

  const disabled = selectedBase === 'MR' || selectedBase === 'SLST';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setInputValue(val);
  };

  const commit = (raw: string) => {
    const n = Math.max(1, parseInt(raw || '1', 10)); // 최소 1
    setCount(n);
    setInputValue(String(n));
  };

  const handleBlur = () => commit(inputValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit(inputValue);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCount(count + 1);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCount(Math.max(1, count - 1));
    }
  };

  const dec = () => setCount(Math.max(1, count - 1));
  const inc = () => setCount(count + 1);

  return (
    <div>
      <SectionTitle title='반복 설정' />

      <div className='bg-background flex w-full items-center justify-center gap-10 rounded-lg py-4'>
        <Button
          variant='ghost'
          size='sm'
          className='!border-[#E0DCD5]'
          onClick={dec}
          disabled={selectedBase === 'MR' || selectedBase === 'SLST'}
        >
          -
        </Button>

        <input
          type='text'
          inputMode='numeric'
          pattern='\d*'
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className='w-10 text-center font-bold outline-none disabled:opacity-50'
          aria-label='반복 횟수'
        />

        <Button
          variant='ghost'
          size='sm'
          className='!border-[#E0DCD5]'
          onClick={inc}
          disabled={selectedBase === 'MR' || selectedBase === 'SLST'}
        >
          +
        </Button>
      </div>
    </div>
  );
}

export default RepeatCountControl;
