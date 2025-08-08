import Icon from '@/components/ui/Icon';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';

function Main() {
  return (
    <div className='max-wide:px-10 flex min-h-[calc(100vh-80px)] min-w-[1440px] items-center bg-[url(/assets/images/background.webp)] bg-cover py-15'>
      <div className='mx-auto flex w-[1440px] justify-between gap-12'>
        <Card>
          <Button variant='ghost'>zz</Button>
          <Button variant='ghost' size='sm'>
            zz
          </Button>
          <Button variant='ghost' size='lg'>
            zz
          </Button>
          <Button>zz</Button>

          <div className='flex items-center gap-2 py-10'>
            <Icon
              name='checkbox'
              // color='red'
              width={24}
              className='text-text-heading'
              onClick={() => console.log('click')}
            />
            그룹 사용
          </div>
        </Card>
        <Card>Card</Card>
        <Card>Card</Card>
      </div>
    </div>
  );
}

export default Main;
