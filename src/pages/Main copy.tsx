import { useState } from 'react';

import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import CheckBox from '@components/ui/CheckBox';
import Icon from '@components/ui/Icon';
import Input from '@components/ui/Input';
import SelectBox from '@components/ui/SelectBox';

function Main() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true },
  ];

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
            <Button variant='ghost' size='lg' disableHover={false}>
              zz
            </Button>
            <Button>zz</Button>
            <Button disabled>zz</Button>
          </div>

          <div className='py-5'>
            <Icon
              name='Checkbox'
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

          <div className='py-5'>
            <Input value={inputValue} onChange={setInputValue} />
            <Input value={inputValue} onChange={setInputValue} disabled />
            <Input value={inputValue} onChange={setInputValue} readOnly />
            <Input
              value={inputValue}
              onChange={setInputValue}
              fullWidth
              error='⚠ 이전 단보다 코 수가 증가하거나 감소했지만, 늘림뜨기나 줄임뜨기가 사용되지 않았어요.'
            />
          </div>

          <div className='flex flex-col gap-4 py-5'>
            <SelectBox
              options={options}
              value={selectValue}
              placeholder='Option을 선택해 주세요.'
              onChange={(value) => setSelectValue(value)}
              size='sm'
            />
            <SelectBox
              options={options}
              value={selectValue}
              placeholder='Option을 선택해 주세요.'
              onChange={(value) => setSelectValue(value)}
            />
            <SelectBox
              options={options}
              value={selectValue}
              placeholder='Option을 선택해 주세요.'
              onChange={(value) => setSelectValue(value)}
              size='lg'
              disabled
            />
          </div>
        </Card>
        <Card>Card</Card>
        <Card>Card</Card>
      </div>
    </div>
  );
}

export default Main;
