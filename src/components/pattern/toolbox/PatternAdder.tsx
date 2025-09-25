import { useEffect, useState } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import { useEditorStore } from '@store/editor.store';
import { usePatternStore } from '@store/pattern.store';
import { draftToString } from '@utils/patternUI';

function PatternAdder() {
  const [patternInput, setPatternInput] = useState<string>('');

  const selectedRoundId = usePatternStore((s) => s.selectedRoundId);
  const draft = useEditorStore((s) => s.draft);
  const commitAsOperation = useEditorStore((s) => s.commitAsOperation);

  useEffect(() => {
    const next = draftToString(draft) || '';
    setPatternInput((prev) => (prev === next ? prev : next));
  }, [draft]);

  const canAdd =
    !!selectedRoundId &&
    (draft.grouping ? draft.tokens.length > 0 : !!draft.base);

  const handleAdd = () => commitAsOperation();

  return (
    <div>
      <SectionTitle title='도안 추가' />

      <div className='flex gap-2'>
        <Input
          value={patternInput}
          onChange={setPatternInput}
          className='flex-auto'
          readOnly
          fullWidth
        />
        <Button className='flex-none' onClick={handleAdd} disabled={!canAdd}>
          추가
        </Button>
      </div>
    </div>
  );
}

export default PatternAdder;
