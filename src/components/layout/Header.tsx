import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';

function Header() {
  return (
    <div className='max-wide:px-10 relative h-20 min-w-[1440px] shadow-[0_1px_4px_0_rgba(0,0,0,0.1)]'>
      <div className='max-wide:w-full mx-auto flex w-[1440px] justify-between'>
        <div>
          <img src='/assets/images/logo.png' alt='logo' className='w-20' />
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center justify-center gap-1'
          >
            <Icon name='Import' className='text-text' width={20} /> 불러오기
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center justify-center gap-1'
          >
            <Icon name='Export' className='text-text' width={20} /> 내보내기
          </Button>
          <Button
            variant='default'
            size='sm'
            className='flex items-center justify-center gap-1'
          >
            <Icon name='Save' className='text-white' width={20} />
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
