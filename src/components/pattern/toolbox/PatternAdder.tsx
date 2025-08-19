import { memo, useId, useState } from 'react';

import { Tooltip } from 'react-tooltip';

import 'react-tooltip/dist/react-tooltip.css';
import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import Input from '@components/ui/Input';

type InfoTooltipProps = {
  content: string;
  place?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
};

const InfoTooltip = memo(
  ({ content, place = 'right', className }: InfoTooltipProps) => {
    const tipId = useId();

    return (
      <>
        <button
          type='button'
          aria-label='도움말'
          data-tooltip-id={tipId}
          data-tooltip-content={content}
          className='focus-visible:ring-secondary/50 inline-flex items-center justify-center rounded-md outline-none focus-visible:ring-2'
        >
          <Icon
            name='Help'
            width={14}
            className='text-secondary cursor-pointer'
          />
        </button>
        <Tooltip
          id={tipId}
          place={place}
          className={
            className ??
            '!bg-secondary !rounded-lg !px-3 !py-2 !text-xs !font-light !text-white !shadow-lg'
          }
        />
      </>
    );
  },
);

function PatternAdder() {
  const [patternInput, setPatternInput] = useState<string>('');

  const tipText =
    '도안은 버튼 클릭으로 자동 입력되며, 규칙에 맞게 직접 작성해도 추가할 수 있습니다. 예: SC ×6, (SC, SC-INC2) ×6';

  return (
    <div>
      <SectionTitle
        title={
          <div className='flex items-center gap-3'>
            <span>도안 추가</span>
            <InfoTooltip content={tipText} />
          </div>
        }
      />

      <div className='flex gap-2'>
        <Input
          value={patternInput}
          onChange={setPatternInput}
          className='flex-auto'
          fullWidth
        />
        <Button className='flex-none'>추가</Button>
      </div>
    </div>
  );
}

export default PatternAdder;
