import { useCallback } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useShallow } from 'zustand/shallow';

import SortableToken from '@components/pattern//toolbox/SortableToken';
import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import Button from '@components/ui/Button';
import CheckBox from '@components/ui/CheckBox';
import NumberStepper from '@components/ui/NumberStepper';
import { useEditorStore } from '@store/editor.store';
import { formatArity, tokenLabel } from '@utils/pattern';

function GroupComposer() {
  const isGrouping = useEditorStore((s) => s.draft.grouping);
  const setGrouping = useEditorStore((s) => s.setGrouping);
  const base = useEditorStore((s) => s.draft.base);
  const arity = useEditorStore((s) => s.draft.arity);
  const times = useEditorStore((s) => s.draft.times);
  const tokens = useEditorStore(useShallow((s) => s.draft.tokens));
  const repeat = useEditorStore((s) => s.draft.repeat);

  const stageCurrentToken = useEditorStore((s) => s.stageCurrentToken);
  const removeStagedToken = useEditorStore((s) => s.removeStagedToken);
  const moveStagedToken = useEditorStore((s) => s.moveStagedToken);
  const setRepeat = useEditorStore((s) => s.setRepeat);

  const onGroupingChange = useCallback(
    (checked: boolean) => setGrouping(checked),
    [setGrouping],
  );

  return (
    <div>
      <SectionTitle
        title='그룹 조립'
        right={
          <CheckBox
            label='그룹 사용'
            checked={isGrouping}
            onChange={onGroupingChange}
            size='sm'
          />
        }
      />

      {!isGrouping ? (
        <div className='text-muted-foreground text-xs'>
          그룹 사용을 켜면 조합을 구성할 수 있어요.
        </div>
      ) : (
        <section
          className='border-border flex flex-col gap-4 rounded-lg border border-dashed p-3'
          aria-live='polite'
        >
          {/* 현재 토큰 + 추가 버튼 */}
          <div className='flex items-start justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <p className='font-bold'>현재 토큰:</p>
              <div className='flex items-center gap-2'>
                {base && <span>{base}</span>}+
                <span>
                  <span>{formatArity(arity)}</span>
                </span>{' '}
                +{times && <span>×{times}</span>}
              </div>
            </div>
            <Button
              size='sm'
              className='px-2 py-1 text-xs'
              variant='ghost'
              onClick={stageCurrentToken}
            >
              그룹에 추가
            </Button>
          </div>

          {/* 그룹 토큰 리스트 */}
          <div className='text-sm'>
            <p className='font-bold'>그룹 토큰 리스트</p>

            <DndProvider backend={HTML5Backend}>
              <div
                className='mt-2 flex flex-wrap items-center gap-2'
                role='list'
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
              >
                {tokens.length === 0 ? (
                  <span className='text-muted-foreground'>
                    아직 추가된 토큰이 없어요.
                  </span>
                ) : (
                  tokens.map((t, i) => (
                    <SortableToken
                      key={t.id}
                      id={t.id}
                      index={i}
                      label={tokenLabel(t)}
                      onRemove={() => removeStagedToken(i)}
                      onMove={moveStagedToken}
                    />
                  ))
                )}
              </div>
            </DndProvider>
          </div>

          {/* 그룹 반복 */}
          <div className='flex items-center justify-between text-sm'>
            <p className='font-bold'>그룹 반복</p>
            <NumberStepper
              value={repeat}
              onChange={setRepeat}
              min={1}
              max={99}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default GroupComposer;
