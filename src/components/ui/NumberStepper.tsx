type NumberStepperProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  className = '',
}: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div
      className={
        'inline-flex items-stretch overflow-hidden rounded-md border border-gray-200 bg-white ' +
        className
      }
      role='group'
      aria-label='숫자 스테퍼'
    >
      <button
        type='button'
        className='px-2 text-sm hover:bg-gray-50'
        aria-label='감소'
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <input
        className='w-12 border-x border-gray-200 bg-transparent px-2 text-center text-sm outline-none'
        inputMode='numeric'
        pattern='[0-9]*'
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value || '0', 10);
          if (Number.isNaN(n)) return;
          onChange(clamp(n));
        }}
        aria-live='polite'
      />
      <button
        type='button'
        className='px-2 text-sm hover:bg-gray-50'
        aria-label='증가'
        onClick={() => onChange(clamp(value + step))}
      >
        +
      </button>
    </div>
  );
}

export default NumberStepper;
