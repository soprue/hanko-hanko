import type { HSVA, RGBA } from '@/types/colorPicker';

/**
 * 숫자 값을 주어진 범위로 잘라(clamp) 반환합니다. (양 끝 포함)
 *
 * @param n - 대상 값
 * @param min - 하한값 (기본값: 0)
 * @param max - 상한값 (기본값: 100)
 * @returns min ≤ n ≤ max 범위로 제한된 값
 * @example
 * clamp(120, 0, 100) // 100
 * clamp(-5, 0, 100)  // 0
 */
const clamp = (n: number, min: number = 0, max: number = 100) =>
  Math.max(min, Math.min(max, n));

/**
 * RGB(0~255) 색을 HSV로 변환합니다.
 *
 * @remarks
 * - Hue(색상)는 0~360도 범위, Saturation/Value는 0~1 범위로 반환됩니다.
 * - Alpha는 입력값을 그대로 전달합니다(기본 1).
 *
 * @param rgb - { r, g, b, a } 형태의 RGB 색상. r/g/b는 0~255, a는 0~1
 * @returns HSVA 객체 (h: 0~360, s: 0~1, v: 0~1, a: 0~1)
 * @example
 * rgbToHsv({ r: 255, g: 0, b: 0, a: 1 }) // { h: 0, s: 1, v: 1, a: 1 }
 */
function rgbToHsv({ r, g, b, a = 1 }: RGBA): HSVA {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const d = max - min;

  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v, a };
}

/**
 * HSV 색을 RGB(0~255)로 변환합니다.
 *
 * @remarks
 * - 입력 h는 보통 0~360 범위를 사용합니다.
 * - 반환되는 r/g/b는 0~255 범위의 정수로 반올림됩니다.
 * - Alpha는 입력값을 그대로 전달합니다.
 *
 * @param hsv - { h, s, v, a } 형태의 HSV 색상. h: 각도(보통 0~360), s/v: 0~1, a: 0~1
 * @returns RGBA 객체 (r/g/b: 0~255 정수, a: 0~1)
 * @example
 * hsvToRgb({ h: 200, s: 0.5, v: 0.8, a: 1 }) // { r: 102, g: 170, b: 204, a: 1 }
 */
function hsvToRgb({ h, s, v, a }: HSVA): RGBA {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
}

/**
 * RGB 색을 HEX 문자열(#RRGGBB, 대문자)로 변환합니다.
 *
 * @remarks
 * - r/g/b는 0~255로 clamp한 뒤 2자리 16진수로 변환합니다.
 * - 알파 채널은 포함하지 않습니다. 투명도를 표현하려면 rgba()를 사용하세요.
 *
 * @param rgba - { r, g, b, a } 형태의 RGB 색상
 * @param includeAlpha - 알파 포함 여부 (기본 true)
 * @returns "#RRGGBB" 또는 "#RRGGBBAA" 형식의 문자열
 * @example
 * rgbaToHex({ r: 255, g: 128, b: 0 }) // "#FF8000"
 */

function rgbaToHex({ r, g, b, a = 1 }: RGBA, includeAlpha?: boolean) {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');

  const rr = toHex(r);
  const gg = toHex(g);
  const bb = toHex(b);
  const aa = toHex(clamp(Math.round((a ?? 1) * 255), 0, 255)); // a: 0~1 → 0~255

  const hex = includeAlpha ? `${rr}${gg}${bb}${aa}` : `${rr}${gg}${bb}`;

  return `#${hex}`.toLowerCase();
}

/**
 * HEX 문자열을 RGB로 변환합니다.
 *
 * @remarks
 * - 지원 형식: "#RGB" 또는 "#RRGGBB" (대소문자 무관, 앞의 '#'은 생략 가능)
 * - 유효하지 않은 경우 `null`을 반환합니다.
 * - 알파 정보가 없으므로 `a: 1`로 고정됩니다.
 *
 * @param hex - HEX 색상 문자열
 * @returns RGBA 객체 또는 null
 * @example
 * hexToRgb('#09F')     // { r: 0, g: 153, b: 255, a: 1 }
 * hexToRgb('#FF8000')  // { r: 255, g: 128, b: 0, a: 1 }
 * hexToRgb('zzz')      // null
 */
function hexToRgb(hex: string): RGBA | null {
  const m = hex.trim().replace(/^#/, '');
  if (![3, 6].includes(m.length)) return null;
  const s =
    m.length === 3
      ? m
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : m;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a: 1 };
}

/**
 * RGBA 값을 CSS `rgba(r, g, b, a)` 문자열로 변환합니다.
 *
 * @remarks
 * - Alpha는 소수점 둘째 자리까지 표현됩니다.
 *
 * @param rgba - { r, g, b, a } 형태의 RGBA 색상 (a 기본값: 1)
 * @returns CSS용 rgba 문자열
 * @example
 * rgbaString({ r: 102, g: 170, b: 204, a: 0.3 }) // "rgba(102, 170, 204, 0.30)"
 */
const rgbaString = ({ r, g, b, a = 1 }: RGBA) =>
  `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;

export { clamp, rgbToHsv, rgbaToHex, hsvToRgb, rgbaString, hexToRgb };
