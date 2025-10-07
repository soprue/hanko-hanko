import { useEffect, useRef } from 'react';

import { usePatternStore } from '@store/pattern.store';

function useInitNewPatternOnce() {
  const newPattern = usePatternStore((s) => s.newPattern);
  const ranRef = useRef(false); // StrictMode 2회 방지

  useEffect(() => {
    const runOnce = () => {
      if (ranRef.current) return;
      ranRef.current = true;

      if (usePatternStore.getState().rounds.length === 0) {
        newPattern();
      }
    };

    const persist = usePatternStore.persist;

    // persist 자체가 없음 → 바로 실행
    if (!persist?.hasHydrated) {
      runOnce();
      return;
    }

    // 이미 복구 완료 → 즉시 실행
    if (persist.hasHydrated()) {
      runOnce();
      return;
    }

    // 아직 복구 전 → 복구 완료 이벤트 구독
    const unsub = persist.onFinishHydration?.(runOnce);

    // 레이스 안전망
    queueMicrotask?.(runOnce);

    return () => unsub?.();
  }, [newPattern]);
}

export default useInitNewPatternOnce;
