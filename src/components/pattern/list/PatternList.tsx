import PatternListItem from '@components/pattern/list/PatternListItem';
import { usePatternStore } from '@store/pattern.store';

function PatternList() {
  const rounds = usePatternStore((s) => s.rounds);

  return (
    <div className='flex flex-auto flex-col gap-8'>
      {rounds.map((round) => {
        const roundTitle = round.meta?.roundIndex
          ? `[${round.meta.roundIndex}단]`
          : '';
        const roundTotal =
          round.totalStitches != null ? `총 ${round.totalStitches}코` : '';

        const warning = round.meta?.warnings;

        return (
          <div>
            <div className='mb-3 text-sm'>
              <span className='font-bold'>{roundTitle}</span> - {roundTotal}
            </div>

            <div className='flex flex-col gap-2'>
              {round.ops.map((op) => {
                return <PatternListItem item={op} warning={warning} />;
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
