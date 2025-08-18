import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  triggerLabel?: string;
  emptyText?: string;
};

const base =
  'relative inline-flex items-center justify-between border transition-all duration-200 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-text-heading ease-in-out';

const variants = {
  outline: `
    border-border bg-white text-text
    enabled:hover:bg-background
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
  triggerLabel,
  emptyText = '옵션이 없습니다.',
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
    () => options.findIndex((o) => o.value === value),
    [options, value],
  );
  const current = currentIndex >= 0 ? options[currentIndex] : undefined;

  const firstEnabledIndex = useMemo(
    () => options.findIndex((o) => !o.disabled),
    [options],
  );

  useEffect(() => {
    if (!open) return;
    const baseIdx =
      currentIndex >= 0 && !options[currentIndex]?.disabled
        ? currentIndex
        : firstEnabledIndex;
    setHighlight(baseIdx);
  }, [open, currentIndex, firstEnabledIndex, options]);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setOpen((v) => !v);
  }, [disabled]);

  const selectAt = useCallback(
    (idx: number) => {
      const option = options[idx];
      if (!option || option.disabled) return;
      if (option.value !== value) onChange(option.value);
      setOpen(false);
    },
    [onChange, options, value],
  );

  const getNextEnabledIndex = useCallback(
    (start: number, dir: 1 | -1) => {
      if (options.length === 0) return -1;
      let i = start;
      for (let step = 0; step < options.length; step++) {
        i = (i + dir + options.length) % options.length;
        if (!options[i]?.disabled) return i;
      }
      return -1;
    },
    [options],
  );

  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLButtonElement>>(
    (e) => {
      if (!open) {
        if (
          e.key === 'Enter' ||
          e.key === ' ' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp'
        ) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const base = highlight >= 0 ? highlight : firstEnabledIndex;
        const next = getNextEnabledIndex(base >= 0 ? base : -1, 1);
        if (next >= 0) setHighlight(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const base = highlight >= 0 ? highlight : firstEnabledIndex;
        const prev = getNextEnabledIndex(base >= 0 ? base : 0, -1);
        if (prev >= 0) setHighlight(prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlight >= 0) selectAt(highlight);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    },
    [open, highlight, firstEnabledIndex, getNextEnabledIndex, selectAt],
  );

  const onOptionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const idxAttr = (e.currentTarget as HTMLButtonElement).dataset.index;
      if (idxAttr == null) return;
      const idx = Number(idxAttr);
      if (!Number.isNaN(idx)) selectAt(idx);
    },
    [selectAt],
  );

  const triggerContent = useMemo(() => {
    if (triggerLabel !== undefined) return triggerLabel;
    return current?.label ?? placeholder;
  }, [triggerLabel, current, placeholder]);

  const listboxId = useMemo(
    () => `selectbox-listbox-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const activeId =
    open && highlight >= 0 ? `${listboxId}-opt-${highlight}` : undefined;

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        type='button'
        role='combobox'
        aria-expanded={open}
        aria-haspopup='listbox'
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={activeId}
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
          'peer-focus-visible:outline-foreground peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2',
        )}
      >
        <span
          className={cn(
            s.text,
            'mx-auto truncate',
            !current && !triggerLabel && 'text-text/30',
          )}
        >
          {triggerContent}
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
          id={listboxId}
          role='listbox'
          aria-label='선택 목록'
          className={cn(
            'border-border absolute right-0 left-0 z-50 mt-1.5 flex flex-col gap-2 overflow-auto rounded-xl border bg-white',
            'max-h-72 p-2',
            menuClassName,
          )}
        >
          {options.length === 0 ? (
            <div
              className={cn('text-text/40 p-2 text-center text-xs')}
              aria-live='polite'
            >
              {emptyText}
            </div>
          ) : (
            options.map((option, idx) => {
              const isSelected = value === option.value;
              const isHighlighted = idx === highlight;

              return (
                <button
                  type='button'
                  role='option'
                  id={`${listboxId}-opt-${idx}`}
                  aria-selected={isSelected}
                  key={`${option.value}-${idx}`}
                  disabled={!!option.disabled}
                  data-index={idx}
                  onClick={onOptionClick}
                  className={cn(
                    'focus-visible:outline-foreground/10 w-full rounded-md text-center transition-all duration-200 ease-in-out focus-visible:outline-1',
                    s.menuItem,
                    option.disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'enabled:hover:bg-background cursor-pointer',
                    isSelected && 'bg-background',
                    isHighlighted &&
                      !option.disabled &&
                      'outline-foreground/10 outline-1',
                  )}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default SelectBox;
