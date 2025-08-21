import SectionHeader from '@components/pattern/SectionHeader';
import PatternAdder from '@components/pattern/toolbox/PatternAdder';
import RepeatCountControl from '@components/pattern/toolbox/RepeatCountControl';
import StitchBasePicker from '@components/pattern/toolbox/StitchBasePicker';
import StitchVariationSelector from '@components/pattern/toolbox/StitchVariationSelector';
import YarnColorPicker from '@components/pattern/toolbox/YarnColorPicker';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function ToolboxCard() {
  return (
    <Card>
      <SectionHeader
        title='뜨개 도구 상자'
        help={<Icon name='Pallet' width={20} className='text-primary' />}
      />

      <div className='flex flex-col gap-6'>
        <StitchBasePicker />
        <StitchVariationSelector />
        <RepeatCountControl />
        <PatternAdder />
        <YarnColorPicker />
      </div>
    </Card>
  );
}

export default ToolboxCard;
