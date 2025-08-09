import { cn } from '@utils/cn';

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  size?: InputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  error?: string;
};

const base =
  'block rounded-md border outline-none transition-all duration-200 ease-in-out focus:ring-1';

const variants = {
  default: `
    border-border bg-white text-text
    disabled:opacity-30 disabled:cursor-not-allowed
    read-only:opacity-80 read-only:cursor-default
    `,
  error: `
    border-[var(--warning)] text-text
    disabled:opacity-30 disabled:cursor-not-allowed
    read-only:opacity-80 read-only:cursor-default
    `,
};

const sizes: Record<InputSize, string> = {
  sm: 'text-sm px-2 py-1.5',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-2.5',
};

function Input({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  size = 'md',
  fullWidth = false,
  disabled = false,
  readOnly = false,
  className,
  error,
}: InputProps) {
  return (
    <div>
      {label && (
        <label
          className={cn(
            'font-medium',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
          )}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          base,
          error ? variants.error : variants.default,
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
      />

      {error && <span className='text-warning text-sm'>{error}</span>}
    </div>
  );
}

export default Input;
