import SectionHeader from '@components/pattern/SectionHeader';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function Preview3DCard() {
  return (
    <Card>
      <SectionHeader
        title='3D 미리보기'
        help={<Icon name='Cube' width={20} className='text-primary' />}
      />
    </Card>
  );
}

export default Preview3DCard;
