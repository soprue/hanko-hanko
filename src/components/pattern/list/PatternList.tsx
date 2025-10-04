import type { RoundWithMeta } from '@/types/patterns';
import PatternListItem from '@components/pattern/list/PatternListItem';
import { useGlobalModalStore } from '@store/modal.store';
import { usePatternStore } from '@store/pattern.store';

function PatternList() {
  const openModal = useGlobalModalStore((s) => s.openModal);
  const closeModal = useGlobalModalStore((s) => s.closeModal);
  const removeRound = usePatternStore((s) => s.removeRound);
  const rounds = usePatternStore((s) => s.rounds);

  const handleDelete = (round: RoundWithMeta) => {
    openModal({
      title: `정말 ${round.meta?.roundIndex}단을 삭제할까요?`,
      children: (
        <div>
          이 단에 포함된 모든 동작이 함께 삭제됩니다. <br />이 작업은 되돌릴 수
          없어요.
        </div>
      ),
      confirmText: '삭제',
      onCancel: closeModal,
      onConfirm: () => {
        removeRound(round.id);
        closeModal();
      },
    });
  };

  return (
    <div className='flex flex-auto flex-col gap-8'>
      {rounds.map((round, i) => {
        const roundTitle = round.meta?.roundIndex
          ? `[${round.meta.roundIndex}단]`
          : '';
        const roundTotal =
          round.totalStitches != null ? `총 ${round.totalStitches}코` : '';

        const warning = round.meta?.warnings;

        return (
          <div key={round.id}>
            <div className='mb-3 flex items-center justify-between text-sm'>
              <div>
                <span className='font-bold'>{roundTitle}</span> - {roundTotal}
              </div>
              {i > 0 && (
                <button
                  className='text-text-muted cursor-pointer text-xs underline'
                  onClick={() => handleDelete(round)}
                >
                  삭제
                </button>
              )}
            </div>

            <div className='flex flex-col gap-2'>
              {round.ops.map((op) => {
                return (
                  <PatternListItem
                    key={op.id}
                    roundId={round.id}
                    item={op}
                    warning={warning}
                  />
                );
              })}
            </div>

            {warning && warning.length !== 0 && (
              <p className='text-warning mt-1 text-xs'>⚠ {warning[0]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PatternList;
