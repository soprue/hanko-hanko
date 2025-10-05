import { useEffect, useState } from 'react';

import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import { useEditorStore } from '@store/editor.store';
import { usePatternStore } from '@store/pattern.store';
import { draftToString } from '@utils/patternUI';

function PatternAdder() {
  const selectedRoundId = usePatternStore((s) => s.selectedRoundId);

  const mode = useEditorStore((s) => s.selection.mode ?? 'create');
  const draft = useEditorStore((s) => s.draft);
  const commitAsOperation = useEditorStore((s) => s.commitAsOperation);
  const cancelEdit = useEditorStore((s) => s.cancelEdit); // ← 추가

  const [patternInput, setPatternInput] = useState<string>('');

  useEffect(() => {
    const next = draftToString(draft) || '';
    setPatternInput((prev) => (prev === next ? prev : next));
  }, [draft]);

  const canCommit =
    !!selectedRoundId &&
    (draft.grouping ? draft.tokens.length > 0 : !!draft.base);

  const isEdit = mode === 'edit';
  const titleText = isEdit ? '도안 수정' : '도안 추가';
  const ctaText = isEdit ? '적용' : '추가';

  const handleCommit = () => {
    if (!canCommit) return;
    commitAsOperation();
  };

  return (
    <div>
      <SectionTitle title={titleText} />

      <div className='flex gap-2'>
        <Input
          value={patternInput}
          onChange={setPatternInput}
          className='flex-auto'
          readOnly
          fullWidth
        />
        {isEdit && (
          <Button className='flex-none' onClick={cancelEdit} variant='ghost'>
            취소
          </Button>
        )}
        <Button
          className='flex-none'
          onClick={handleCommit}
          disabled={!canCommit}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
}

export default PatternAdder;
