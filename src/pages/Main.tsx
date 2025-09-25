import PatternListPanel from '@components/pattern/pannels/PatternListPanel';
import Preview3DPanel from '@components/pattern/pannels/Preview3DPanel';
import ToolboxPanel from '@components/pattern/pannels/ToolboxPanel';
import useInitNewPatternOnce from '@hooks/useInitNewPatternOnce';

function Main() {
  useInitNewPatternOnce();

  return (
    <div className='max-wide:px-10 flex min-h-[calc(100vh-80px)] min-w-[1440px] items-center bg-[url(/assets/images/background.webp)] bg-cover py-15'>
      <div className='mx-auto flex w-[1440px] justify-between gap-12'>
        <ToolboxPanel />
        <Preview3DPanel />
        <PatternListPanel />
      </div>
    </div>
  );
}

export default Main;
