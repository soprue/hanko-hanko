import { cn } from '@utils/cn';

type ButtonVariant = 'default' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  disableHover?: boolean;
  className?: string;
};

const base =
  'rounded-md transition-all duration-200 cursor-pointer ease-in-out';

const variants: Record<ButtonVariant, (disableHover?: boolean) => string> = {
  default: (disableHover) =>
    cn(
      'border border-foreground bg-foreground text-white disabled:opacity-30 disabled:cursor-not-allowed',
      !disableHover && 'enabled:hover:opacity-90',
    ),
  ghost: (disableHover) =>
    cn(
      'border border-border disabled:opacity-30 disabled:cursor-not-allowed',
      !disableHover &&
        'enabled:hover:bg-foreground enabled:hover:text-white enabled:hover:border-foreground',
    ),
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-3',
};

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  disabled = false,
  disableHover = true,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        base,
        variants[variant](disableHover),
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
