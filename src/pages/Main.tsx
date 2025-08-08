import { useState } from 'react';

import CheckBox from '@/components/ui/CheckBox';
import Icon from '@/components/ui/Icon';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';

function Main() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className='max-wide:px-10 flex min-h-[calc(100vh-80px)] min-w-[1440px] items-center bg-[url(/assets/images/background.webp)] bg-cover py-15'>
      <div className='mx-auto flex w-[1440px] justify-between gap-12'>
        <Card>
          <div className='py-5'>
            <Button
              onClick={() => setIsButtonClicked(!isButtonClicked)}
              variant={isButtonClicked ? 'ghost' : 'default'}
              size='sm'
            >
              zz
            </Button>
            <Button variant='ghost' disabled>
              zz
            </Button>
            <Button variant='ghost' size='lg'>
              zz
            </Button>
            <Button>zz</Button>
            <Button disabled>zz</Button>
          </div>

          <div className='py-5'>
            <Icon
              name='checkbox'
              // color='red'
              width={24}
              className='text-text-heading'
              onClick={() => console.log('click')}
            />
          </div>

          <div className='flex flex-col justify-center gap-2 py-5'>
            <CheckBox onChange={() => {}} label='비활성화' disabled size='lg' />
            <CheckBox
              checked={isChecked}
              onChange={setIsChecked}
              label='그룹 사용'
            />
            <CheckBox onChange={() => {}} label='비활성화' disabled size='sm' />
          </div>
        </Card>
        <Card>Card</Card>
        <Card>Card</Card>
      </div>
    </div>
  );
}

export default Main;
