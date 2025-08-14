import SectionHeader from '@components/pattern/SectionHeader';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function PatternListCard() {
  return (
    <Card>
      <SectionHeader
        title='생성된 도안'
        help={<Icon name='List' width={20} className='text-primary' />}
      />
    </Card>
  );
}

export default PatternListCard;
