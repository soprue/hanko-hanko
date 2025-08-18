import SectionHeader from '@components/pattern/SectionHeader';
import StitchBasePicker from '@components/pattern/toolbox/StitchBasePicker';
import StitchVariationSelector from '@components/pattern/toolbox/StitchVariationSelector';
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
      </div>
    </Card>
  );
}

export default ToolboxCard;
