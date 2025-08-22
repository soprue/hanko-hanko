import PatternList from '@components/pattern/list/PatternList';
import SectionHeader from '@components/pattern/SectionHeader';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import Icon from '@components/ui/Icon';

function PatternListPanel() {
  return (
    <Card className='flex flex-col'>
      <SectionHeader
        title='생성된 도안'
        help={<Icon name='List' width={20} className='text-primary' />}
        className='flex-none'
      />

      <PatternList />

      <Button fullWidth className='mt-6 flex-none'>
        단 추가
      </Button>
    </Card>
  );
}

export default PatternListPanel;
