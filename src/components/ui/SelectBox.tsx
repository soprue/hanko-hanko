import { useMemo, useRef, useState } from 'react';

import type { UIComponentSize } from '@/types/ui';
import Icon from '@components/ui/Icon';
import useClickOutside from '@hooks/useClickOutside';
import { cn } from '@utils/cn';

type SelectOption = { label: string; value: string; disabled?: boolean };

type SelectBoxProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: UIComponentSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string; // 트리거 버튼 영역 className
  menuClassName?: string; // 드롭다운 메뉴 영역 className
};

const base =
  'relative inline-flex items-center justify-between border transition-all duration-200 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-text-heading ease-in-out pr-10';

const variants = {
  outline: `
    border-border bg-white text-[var(--text)]
    enabled:hover:bg-[var(--background)]
    disabled:opacity-30 disabled:cursor-not-allowed
  `,
};

const sizes: Record<
  UIComponentSize,
  { field: string; text: string; menuItem: string }
> = {
  sm: {
    field: 'h-10 px-4 rounded-lg',
    text: 'text-sm',
    menuItem: 'text-sm py-2 px-3',
  },
  md: {
    field: 'h-12 px-5 rounded-xl',
    text: 'text-base',
    menuItem: 'text-sm py-2 px-3',
  },
  lg: {
    field: 'h-14 px-6 rounded-2xl',
    text: 'text-lg',
    menuItem: 'text-base py-2 px-4',
  },
};

function SelectBox({
  options,
  value,
  onChange,
  placeholder = '선택하세요.',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  menuClassName,
}: SelectBoxProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside({
    enabled: open,
    refs: [triggerRef, menuRef],
    onClickOutside: () => setOpen(false),
  });

  const s = sizes[size];

  const currentIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const current = currentIndex >= 0 ? options[currentIndex] : undefined;

  const toggleOpen = () => !disabled && setOpen((v) => !v);

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      selectAt(highlight);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const selectAt = (idx: number) => {
    console.log(idx);
    const option = options[idx];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        type='button'
        role='combobox'
        aria-expanded={open}
        aria-haspopup='listbox'
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        className={cn(
          base,
          variants.outline,
          s.field,
          s.text,
          fullWidth && 'w-full',
          !disabled ? 'cursor-pointer' : 'cursor-default',
          className,
          'peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--foreground)]',
        )}
      >
        <span className={cn('mx-auto truncate', !current && 'text-text/30')}>
          {current?.label ?? placeholder}
        </span>

        <Icon
          name='ArrowDropDown'
          className={cn(
            !disabled ? 'text-foreground/60' : 'text-foreground/30',
            'absolute right-4',
          )}
        />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          ref={menuRef}
          role='listbox'
          className={cn(
            'border-border absolute right-0 left-0 z-50 mt-1.5 flex flex-col gap-2 overflow-auto rounded-xl border bg-white',
            'max-h-72 p-2',
            menuClassName,
          )}
        >
          {options.map((option, idx) => {
            const isSelected = value === option.value;
            const isHighlighted = idx === highlight;

            return (
              <button
                type='button'
                role='option'
                aria-selected={isSelected}
                key={`${option.value}-${idx}`}
                disabled={!!option.disabled}
                onClick={() => selectAt(idx)}
                className={cn(
                  'focus-visible:outline-text-heading w-full rounded-md text-left focus-visible:outline-1',
                  s.menuItem,
                  option.disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer enabled:hover:bg-[var(--background)]',
                  isSelected && 'bg-[var(--background)]',
                  isHighlighted &&
                    !option.disabled &&
                    'outline-1 outline-[var(--foreground)]/40',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectBox;
