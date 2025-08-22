import { useState } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';

function RepeatCountControl() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <SectionTitle title='반복 설정' />

      <div className='bg-background flex w-full items-center justify-center gap-10 rounded-lg py-4'>
        <Button
          variant='ghost'
          size='sm'
          className='!border-[#E0DCD5]'
          onClick={() => setCount(count - 1)}
        >
          -
        </Button>
        <span className='font-bold'>{count}</span>
        <Button
          variant='ghost'
          size='sm'
          className='!border-[#E0DCD5]'
          onClick={() => setCount(count + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

export default RepeatCountControl;
