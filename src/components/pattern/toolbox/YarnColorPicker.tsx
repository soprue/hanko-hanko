import { useState } from 'react';

import type { RGBA } from '@/types/colorPicker';
import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import ColorPicker from '@components/ui/ColorPicker';

function YarnColorPicker() {
  const [color, setColor] = useState<RGBA>({ r: 67, g: 151, b: 235, a: 1 });

  return (
    <div>
      <SectionTitle title='실 설정' />
      <ColorPicker value={color} onChange={setColor} showAlpha={false} />
    </div>
  );
}

export default YarnColorPicker;
