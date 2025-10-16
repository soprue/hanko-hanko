import { cn } from '@utils/cn';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'h-[800px] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_8px_10px_0_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
