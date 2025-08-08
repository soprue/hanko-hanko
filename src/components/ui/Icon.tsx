import type { IconType } from '@/types/icon-types';
import { cn } from '@/utils/cn';
import { iconMap } from '@assets/icons/icon-map';

type IconProps = {
  name: IconType;
  width?: number;
  color?: string;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
};

function Icon({ name, width, color, className, onClick }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;

  return (
    <IconComponent
      width={width}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer', className)}
      style={{
        ...(color ? { color } : {}),
      }}
    />
  );
}

export default Icon;
