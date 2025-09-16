import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import { useEditorStore } from '@store/editor.store';

function RepeatCountControl() {
  const count = useEditorStore((s) => s.draft.times);
  const setCount = useEditorStore((s) => s.setTimes);

  const dec = () => setCount(count - 1);
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
        >
          -
        </Button>
        <span className='font-bold'>{count}</span>
        <Button
          variant='ghost'
          size='sm'
          className='!border-[#E0DCD5]'
          onClick={inc}
        >
          +
        </Button>
      </div>
    </div>
  );
}

export default RepeatCountControl;
