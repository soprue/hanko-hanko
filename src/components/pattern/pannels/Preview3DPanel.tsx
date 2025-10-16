import SectionHeader from '@components/pattern/SectionHeader';
import Pattern3DCanvas from '@components/pattern/viewers/Pattern3DCanvas';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function Preview3DPanel() {
  return (
    <Card>
      <SectionHeader
        title='3D 미리보기'
        help={<Icon name='Cube' width={20} className='text-primary' />}
      />

      <Pattern3DCanvas />
    </Card>
  );
}

export default Preview3DPanel;
