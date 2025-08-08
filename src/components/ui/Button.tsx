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
  className?: string;
};

const base =
  'rounded-md transition-all duration-200 cursor-pointer ease-in-out';

const variants: Record<ButtonVariant, string> = {
  default: `
      border border-foreground bg-foreground text-white
      enabled:hover:opacity-90
      disabled:opacity-30 disabled:cursor-not-allowed
    `,
  ghost: `
      border border-border
      enabled:hover:bg-foreground enabled:hover:text-white enabled:hover:border-foreground
      disabled:opacity-30 disabled:cursor-not-allowed
    `,
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
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        base,
        variants[variant],
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
