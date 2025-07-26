import { cn } from '@utils/cn';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
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
  const base =
    'rounded-md transition-all duration-200 cursor-pointer ease-in-out';
  const variants = {
    default: 'border border-foreground bg-foreground text-white',
    ghost:
      'border border-border hover:bg-foreground hover:text-white hover:border-foreground',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-3',
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
