import { useEffect } from 'react';

import * as Sentry from '@sentry/react';

import { usePatternStore } from '@store/pattern.store';

export default function StoreWatcher() {
  const rounds = usePatternStore((s) => s.rounds);

  useEffect(() => {
    if (!Array.isArray(rounds) || rounds.length === 0) return;

    const invalid = rounds.find((r) => !r?.meta?.roundIndex);
    if (invalid) {
      Sentry.captureMessage('Invalid round meta detected', {
        level: 'warning',
        extra: { roundId: invalid.id },
      });
    }
  }, [rounds]);

  return null;
}
