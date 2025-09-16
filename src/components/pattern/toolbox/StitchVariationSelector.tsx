import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import SelectBox from '@components/ui/SelectBox';
import { useEditorStore } from '@store/editor.store';

const INC_OPTIONS = [
  { value: 2, label: '2코 늘림' },
  { value: 3, label: '3코 늘림' },
  { value: 4, label: '4코 늘림' },
];

const DEC_OPTIONS = [
  { value: 2, label: '2코 줄임' },
  { value: 3, label: '3코 줄임' },
  { value: 4, label: '4코 줄임' },
];

function StitchVariationSelector() {
  const selectedArity = useEditorStore((s) => s.draft.arity);
  const setArity = useEditorStore((s) => s.setArity);

  return (
    <div>
      <SectionTitle title='변형 선택' />

      <div className='grid grid-cols-3 gap-2'>
        <Button
          variant={selectedArity === null ? 'default' : 'ghost'}
          className='text-sm'
          onClick={() => setArity(null)}
        >
          기본
        </Button>
        <SelectBox
          variant={selectedArity?.kind === 'inc' ? 'default' : 'ghost'}
          options={INC_OPTIONS}
          fullWidth
          className='h-12'
          size='sm'
          value={selectedArity?.kind === 'inc' ? selectedArity.n : 2}
          onChange={(v) => setArity({ kind: 'inc', n: v as 2 | 3 | 4 })}
          onTriggerClick={() =>
            setArity({
              kind: 'inc',
              n: selectedArity?.kind === 'inc' ? selectedArity.n : 2,
            })
          }
          triggerLabel='늘림'
        />
        <SelectBox
          variant={selectedArity?.kind === 'dec' ? 'default' : 'ghost'}
          options={DEC_OPTIONS}
          fullWidth
          className='h-12'
          size='sm'
          value={selectedArity?.kind === 'dec' ? selectedArity.n : 2}
          onChange={(v) => setArity({ kind: 'dec', n: v as 2 | 3 | 4 })}
          onTriggerClick={() =>
            setArity({
              kind: 'dec',
              n: selectedArity?.kind === 'dec' ? selectedArity.n : 2,
            })
          }
          triggerLabel='줄임'
        />
      </div>
    </div>
  );
}

export default StitchVariationSelector;
