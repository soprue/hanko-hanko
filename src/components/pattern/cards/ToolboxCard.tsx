import SectionHeader from '@components/pattern/SectionHeader';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function ToolboxCard() {
  return (
    <Card>
      <SectionHeader
        title='뜨개 도구 상자'
        help={<Icon name='Pallet' width={20} className='text-primary' />}
      />
    </Card>
  );
}

export default ToolboxCard;
