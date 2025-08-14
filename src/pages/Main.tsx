import PatternListCard from '@components/pattern/cards/PatternListCard';
import Preview3DCard from '@components/pattern/cards/Preview3DCard';
import ToolboxCard from '@components/pattern/cards/ToolboxCard';

function Main() {
  return (
    <div className='max-wide:px-10 flex min-h-[calc(100vh-80px)] min-w-[1440px] items-center bg-[url(/assets/images/background.webp)] bg-cover py-15'>
      <div className='mx-auto flex w-[1440px] justify-between gap-12'>
        <ToolboxCard />
        <Preview3DCard />
        <PatternListCard />
      </div>
    </div>
  );
}

export default Main;
