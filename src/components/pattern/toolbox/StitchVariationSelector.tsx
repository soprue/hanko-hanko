import { useState } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import SelectBox from '@components/ui/SelectBox';

const INC_OPTIONS = [
  { value: 'INC2', label: '2코 늘림' },
  { value: 'INC3', label: '3코 늘림' },
  { value: 'INC4', label: '4코 늘림' },
];

const DEC_OPTIONS = [
  { value: 'DEC2', label: '2코 줄임' },
  { value: 'DEC3', label: '3코 줄임' },
  { value: 'DEC4', label: '4코 줄임' },
];

function StitchVariationSelector() {
  const [inc, setInc] = useState(INC_OPTIONS[0].value);
  const [dec, setDec] = useState(DEC_OPTIONS[0].value);

  return (
    <div>
      <SectionTitle title='변형 선택' />

      <div className='grid grid-cols-3 gap-2'>
        <Button variant='default' className='text-sm'>
          기본
        </Button>
        <SelectBox
          options={INC_OPTIONS}
          fullWidth
          className='px-0'
          value={inc}
          onChange={(v) => setInc(v)}
          triggerLabel='늘림'
        />
        <SelectBox
          options={[]}
          fullWidth
          value={dec}
          onChange={(v) => setDec(v)}
          triggerLabel='줄임'
        />
      </div>
    </div>
  );
}

export default StitchVariationSelector;
