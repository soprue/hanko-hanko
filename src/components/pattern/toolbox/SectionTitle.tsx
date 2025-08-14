import { cn } from '@utils/cn';

type Props = {
  title: string;
  right?: React.ReactNode; // 우측에 토글, 액션 버튼 등
  className?: string;
};

export default function SectionTitle({ title, right, className }: Props) {
  return (
    <div className={cn('mb-3 flex items-center justify-between', className)}>
      <h3 className='text-text text-base font-semibold'>{title}</h3>
      {right && <div className='shrink-0'>{right}</div>}
    </div>
  );
}
