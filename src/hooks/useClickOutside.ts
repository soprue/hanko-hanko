import { useEffect, useMemo, useRef, type RefObject } from 'react';

type Options = {
  enabled?: boolean; // open 같은 상태를 연결해 열렸을 때만 리스너를 켜기 위한 스위치
  refs: RefObject<HTMLElement | null>[]; // “안쪽으로 간주할 요소들”을 여러 개 받을 수 있게 배열로 (트리거 버튼, 메뉴 박스 등)
  onClickOutside: () => void; // 바깥 클릭 시 실행할 콜백
  events?: Array<'pointerdown' | 'mousedown' | 'touchstart'>; // 어떤 다운 이벤트에 반응할지 선택
  detectEscapeKey?: boolean; // Esc 눌렀을 때도 닫을지 여부.
  ignoreTarget?: (target: EventTarget | null) => boolean; // 특정 타깃을 예외 처리하고 싶을 때(예: 드래그 핸들, 토스트, 특정 오버레이 등)
};

function useClickOutside({
  enabled = true,
  refs,
  onClickOutside,
  events = ['pointerdown'],
  detectEscapeKey = true,
  ignoreTarget,
}: Options) {
  // stale closure(오래된 클로저) 문제 방지
  // 이펙트 핸들러는 한 번 바인딩되면 내부에서 참조하는 onOutside가 예전 버전일 수 있음
  // useRef에 최신 콜백을 매 렌더마다 갱신해, 이벤트 핸들러는 언제나 최신을 참조
  const latest = useRef({ onClickOutside, ignoreTarget });
  latest.current.onClickOutside = onClickOutside;
  latest.current.ignoreTarget = ignoreTarget;

  const memoizedEvents = useMemo(() => events, [events]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const target = e.target;

      if (latest.current.ignoreTarget?.(target)) return;

      // 포털/Shadow DOM 대비: composedPath로 포함 여부 판정
      const path =
        'composedPath' in e
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((e as any).composedPath() as EventTarget[])
          : undefined;

      // 등록된 모든 ref 중 하나라도 내부면 “안쪽 클릭”
      const isInside = refs.some((ref) => {
        const el = ref.current;
        if (!el || !target) return false;

        if (target instanceof Node && el.contains(target)) return true;
        if (path && path.includes(el)) return true;

        return false;
      });

      if (!isInside) latest.current.onClickOutside();
    };

    const onEscapeKey = (e: KeyboardEvent) => {
      if (!detectEscapeKey) return;
      if (e.key === 'Escape') latest.current.onClickOutside();
    };

    memoizedEvents.forEach((e) =>
      window.addEventListener(e, handler, { capture: true }),
    );
    if (detectEscapeKey) window.addEventListener('keydown', onEscapeKey);

    return () => {
      memoizedEvents.forEach((e) =>
        window.removeEventListener(e, handler, { capture: true }),
      );
      if (detectEscapeKey) window.removeEventListener('keydown', onEscapeKey);
    };
  }, [enabled, refs, memoizedEvents, detectEscapeKey]);
}

export default useClickOutside;
