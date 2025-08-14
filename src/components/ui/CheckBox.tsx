import { useId } from 'react';

import Icon from '@components/ui/Icon';
import { cn } from '@utils/cn';

type CheckBoxSize = 'sm' | 'md' | 'lg';

type CheckBoxProps = {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: CheckBoxSize;
  className?: string;
};

const base =
  'inline-flex w-fit items-center transition-all duration-200 ease-in-out';

const sizes: Record<
  CheckBoxSize,
  { box: string; icon: number; gap: string; label: string }
> = {
  sm: { box: 'w-4 h-4', icon: 16, gap: 'gap-1.5', label: 'text-sm' },
  md: { box: 'w-5 h-5', icon: 20, gap: 'gap-2', label: 'text-base' },
  lg: { box: 'w-6 h-6', icon: 24, gap: 'gap-2', label: 'text-lg' },
};

function CheckBox({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: CheckBoxProps) {
  const id = useId();
  const s = sizes[size];

  return (
    <label
      htmlFor={id}
      className={cn(
        base,
        s.gap,
        disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
        className,
      )}
    >
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-checked={checked}
        className={cn('peer pointer-events-none absolute opacity-0', s.box)}
      />

      <Icon
        name='Checkbox'
        width={s.icon}
        className={cn(
          'rounded-md transition-all duration-200 ease-in-out',
          checked ? 'text-text-heading' : 'text-text-heading/30',
          'peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--foreground)]',
        )}
      />
      {label && (
        <span className={cn(s.label, 'font-light select-none')}>{label}</span>
      )}
    </label>
  );
}

export default CheckBox;
