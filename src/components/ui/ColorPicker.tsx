import '@/style/colorPicker.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { RgbaColorPicker, RgbColorPicker } from 'react-colorful';

import type { RGBA } from '@/types/colorPicker';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import { clamp, hexToRgb, rgbaString, rgbaToHex } from '@utils/colorPicker';

type ColorPickerProps = {
  value?: RGBA; // 컨트롤드
  defaultValue?: RGBA; // 언컨트롤드 초기값
  onChange: (value: RGBA) => void;
  showAlpha?: boolean;
  swatches?: RGBA[];
  allowCustomSwatch?: boolean; // 현재 색상을 스와치에 추가 버튼 표시
  className?: string;
};

const DEFAULT_SWATCHES: RGBA[] = [
  { r: 255, g: 255, b: 255, a: 1 }, // #FFFFFF
  { r: 0, g: 0, b: 0, a: 1 }, // #000000
  { r: 248, g: 113, b: 113, a: 1 }, // #F87171
  { r: 251, g: 191, b: 36, a: 1 }, // #FBBF24
  { r: 52, g: 211, b: 153, a: 1 }, // #34D399
  { r: 96, g: 165, b: 250, a: 1 }, // #60A5FA
  { r: 167, g: 139, b: 250, a: 1 }, // #A78BFA
  { r: 244, g: 114, b: 182, a: 1 }, // #F472B6
];

const DEFAULT_VALUE: RGBA = { r: 67, g: 151, b: 235, a: 1 };

const CheckerBg = ({ className }: { className?: string }) => (
  <div
    className={('relative overflow-hidden ' + (className ?? '')).trim()}
    style={{
      backgroundImage:
        'linear-gradient(45deg,#ddd 25%,transparent 25%),' +
        'linear-gradient(-45deg,#ddd 25%,transparent 25%),' +
        'linear-gradient(45deg,transparent 75%,#ddd 75%),' +
        'linear-gradient(-45deg,transparent 75%,#ddd 75%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
    }}
  />
);

function ColorPicker({
  value,
  defaultValue = DEFAULT_VALUE,
  onChange,
  swatches = DEFAULT_SWATCHES,
  showAlpha = true,
  allowCustomSwatch = true,
  className,
}: ColorPickerProps) {
  const isControlled = value !== undefined;

  // 내부 상태(언컨트롤드일 때만 실제로 사용)
  const [internalColor, setInternalColor] = useState<RGBA>(
    value ?? defaultValue,
  );
  const color = isControlled ? (value as RGBA) : internalColor;

  // 부가 UI 상태
  const [hexInput, setHexInput] = useState<string>(rgbaToHex(color));
  const [alphaStr, setAlphaStr] = useState<string>(() =>
    String(Math.round((color.a ?? 1) * 100)),
  );
  const [swatchList, setSwatchList] = useState<RGBA[]>(swatches);

  // 색상 변경 핸들러 최적화
  const emitColorChange = useCallback(
    (newColor: RGBA) => {
      if (!isControlled) setInternalColor(newColor);
      onChange?.(newColor);
      setHexInput(rgbaToHex(newColor));
      setAlphaStr(String(Math.round((newColor.a ?? 1) * 100)));
    },
    [isControlled, onChange],
  );

  // 외부 value 변경 동기화
  useEffect(() => {
    if (isControlled && value) {
      setHexInput(rgbaToHex(value));
      setAlphaStr(String(Math.round((value.a ?? 1) * 100)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  // 미리보기 스타일
  const previewStyle = useMemo(
    () => ({ background: rgbaString(color) }),
    [color],
  );

  // HEX 입력 핸들러
  const onHexChange = (val: string) => {
    setHexInput(val);
    const rgb = hexToRgb(val);
    if (!rgb) return;
    emitColorChange({ ...rgb, a: color.a ?? 1 });
  };

  // 알파(%)
  const onAlphaChangePct = (pct: number) => {
    const a = clamp(pct, 0, 100) / 100;
    emitColorChange({ ...color, a });
  };

  const handleAlphaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value;
    if (/^\d{0,3}$/.test(s)) setAlphaStr(s);
    const n = Number(s);
    if (!Number.isNaN(n)) onAlphaChangePct(clamp(n));
  };

  const handleAlphaBlur = () => {
    const n = clamp(Number(alphaStr || '0'));
    setAlphaStr(String(n));
    onAlphaChangePct(n);
  };

  const handleEyedropper = async () => {
    if (window.EyeDropper) {
      const eye = new window.EyeDropper();

      try {
        const res = await eye.open(); // { sRGBHex: "#rrggbb" }
        const rgb = hexToRgb(res.sRGBHex);
        if (rgb) emitColorChange({ ...rgb, a: showAlpha ? (color.a ?? 1) : 1 });
      } catch {
        /* empty */
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((navigator as any).permissions) {
      console.info('EyeDropper not supported.');
    }
  };

  const addSwatch = () =>
    setSwatchList((prev) => [color, ...prev].slice(0, 24));

  const clearSwatches = () => setSwatchList(DEFAULT_SWATCHES);

  const handleSwatchClick = (rgba: RGBA) => emitColorChange({ ...rgba });

  const copyHex = async () => {
    try {
      await navigator.clipboard.writeText(
        rgbaToHex(
          {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a,
          },
          showAlpha ? true : false,
        ),
      );
    } catch {
      /* empty */
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleColorfulChange = (next: any) => {
    // RgbColorPicker는 {r,g,b}, RgbaColorPicker는 {r,g,b,a}를 전달
    const nextColor: RGBA = {
      r: Math.round(next.r),
      g: Math.round(next.g),
      b: Math.round(next.b),
      a: showAlpha ? (typeof next.a === 'number' ? next.a : (color.a ?? 1)) : 1,
    };
    emitColorChange(nextColor);
  };

  return (
    <div
      className={
        'flex w-full max-w-[640px] flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ' +
        (className ?? '')
      }
    >
      <div className='colorPicker'>
        {showAlpha ? (
          <RgbaColorPicker color={color} onChange={handleColorfulChange} />
        ) : (
          <RgbColorPicker
            color={{ r: color.r, g: color.g, b: color.b }}
            onChange={handleColorfulChange}
          />
        )}
      </div>

      {/* 컨트롤 패널 */}
      <div className='flex items-center gap-1'>
        <Button variant='ghost' onClick={handleEyedropper} className='!p-2'>
          <Icon name='Droplet' width={20} color='#444' />
        </Button>

        <div className='text-text flex h-9.5 w-full items-center rounded-xl border border-neutral-200 px-3 text-sm'>
          <div className='flex h-full flex-auto items-center'>
            <div className='size-4 rounded-full' style={previewStyle} />
            <span className='pl-2'>#</span>
            <input
              value={hexInput.replace(/^#/, '')}
              onChange={(e) =>
                onHexChange(
                  `#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`,
                )
              }
              className='h-10 w-24 bg-transparent outline-none'
              spellCheck={false}
              aria-label='HEX'
            />
          </div>

          {showAlpha && (
            <div className='border-border flex h-full w-12 flex-none items-center justify-center border-l'>
              <input
                id='alpha-input'
                type='number'
                inputMode='numeric'
                min={0}
                max={100}
                step={1}
                value={alphaStr}
                onChange={handleAlphaInputChange}
                onBlur={handleAlphaBlur}
                className='w-4/5 text-right'
                aria-label='불투명도 (0~100%)'
              />
              <span>%</span>
            </div>
          )}
        </div>

        <Button variant='ghost' onClick={copyHex} className='!p-2'>
          <Icon name='Copy' width={20} color='#444' />
        </Button>
        <Button variant='ghost' onClick={addSwatch} className='!p-2'>
          <Icon name='Plus' width={20} color='#444' />
        </Button>
      </div>

      {/* 스와치 */}
      <div className='border-border flex items-center justify-between border-t pt-3'>
        <div className='text-xs text-neutral-500'>Saved colors</div>
        {allowCustomSwatch && (
          <button
            onClick={clearSwatches}
            className='inline-flex cursor-pointer items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700'
          >
            <Icon name='Trash' width={14} /> 초기화
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-2'>
        {swatchList.map((c: RGBA, idx) => {
          return (
            <button
              key={idx}
              onClick={() => handleSwatchClick(c)}
              className='relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-neutral-200'
              title={rgbaString(c)}
              aria-label={rgbaString(c)}
            >
              <CheckerBg className='absolute inset-0' />
              <div
                className='absolute inset-0'
                style={{ background: rgbaString(c) }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ColorPicker;
