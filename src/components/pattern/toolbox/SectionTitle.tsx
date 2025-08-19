import { cn } from '@utils/cn';

type Props = {
  title: React.ReactNode;
  right?: React.ReactNode; // 우측에 토글, 액션 버튼 등
  className?: string;
};

export default function SectionTitle({ title, right, className }: Props) {
  return (
    <div className={cn('mb-3 flex items-center justify-between', className)}>
      <span className='text-text inline-flex items-center gap-3 truncate text-base font-semibold break-keep whitespace-nowrap'>
        {title}
      </span>
      {right && <div className='shrink-0'>{right}</div>}
    </div>
  );
}
