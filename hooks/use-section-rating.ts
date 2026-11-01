'use client';

import { useCallback, useSyncExternalStore } from 'react';

// In-memory listener registry to update subscribers immediately in the same tab
const ratingListeners = new Set<() => void>();

function notifyRatingChange() {
  ratingListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

/**
 * Idiomatic React hook for reading and writing section ratings in localStorage
 * using useSyncExternalStore to prevent SSR hydration mismatches and cascading render lint errors.
 */
export function useSectionRating(
  storageKey: string
): ['up' | 'down' | null, (val: 'up' | 'down') => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      ratingListeners.add(callback);

      const handleStorage = (e: StorageEvent) => {
        if (e.key === storageKey) callback();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorage);
      }

      return () => {
        ratingListeners.delete(callback);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', handleStorage);
        }
      };
    },
    [storageKey]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return (localStorage.getItem(storageKey) as 'up' | 'down') || null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const getServerSnapshot = useCallback(() => null, []);

  const rating = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setRating = useCallback(
    (newRating: 'up' | 'down') => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, newRating);
        }
      } catch {
        // storage quota or private mode fallback
      }
      notifyRatingChange();
    },
    [storageKey]
  );

  return [rating, setRating];
}
