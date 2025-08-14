import { cn } from '@utils/cn';

type SectionHeaderProps = {
  title: string;
  help?: React.ReactNode; // 아이콘/툴팁
  className?: string;
};

function SectionHeader({ title, help, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-center gap-3', className)}>
      {help}
      <h2 className='text-text-heading text-xl font-bold'>{title}</h2>
    </div>
  );
}

export default SectionHeader;
