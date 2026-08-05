import { vi } from 'vitest';

/**
 * `localStorage` is NOT functional under this project's jsdom config.
 *
 * Vitest boots jsdom with Node's own experimental `localStorage` gating in
 * play (`ExperimentalWarning: localStorage is not available because
 * --localstorage-file was not provided`). The upshot, verified empirically:
 * `window.sessionStorage` is a real `Storage`, but `window.localStorage` —
 * although present in `Object.getOwnPropertyNames(window)` — evaluates to
 * `undefined`, so `typeof localStorage === 'undefined'`.
 *
 * Anything reading it therefore lands in its own `catch` and silently takes the
 * default. A test written against the real global would pass while asserting
 * nothing, so the storage is stubbed instead.
 */

export interface LocalStorageStub {
  /** The stub installed on `globalThis`. */
  storage: Storage;
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  /** Read the backing store directly, bypassing the spies. */
  read: (key: string) => string | null;
  /** Restore the original (broken) descriptor. Call from `afterEach`. */
  restore: () => void;
}

/**
 * Install a spy-backed `localStorage` on `globalThis`.
 *
 * Must run BEFORE `render()`: `FilterGridProvider` reads storage from a lazy
 * `useState` initializer, which fires exactly once on mount.
 *
 * @param seed initial contents of the store
 */
export const installLocalStorageStub = (seed: Record<string, string> = {}): LocalStorageStub => {
  const store = new Map<string, string>(Object.entries(seed));

  const getItem = vi.fn((key: string): string | null => store.get(key) ?? null);
  const setItem = vi.fn((key: string, value: string): void => {
    store.set(key, String(value));
  });
  const removeItem = vi.fn((key: string): void => {
    store.delete(key);
  });
  const clear = vi.fn((): void => store.clear());
  const key = vi.fn((index: number): string | null => [...store.keys()][index] ?? null);

  const storage: Storage = {
    getItem,
    setItem,
    removeItem,
    clear,
    key,
    get length() {
      return store.size;
    },
  };

  // Capture the existing descriptor verbatim so the restore is exact — the
  // property exists on the global with an undefined value, and deleting it
  // outright would not be a faithful reset.
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
    enumerable: true,
  });

  return {
    storage,
    getItem,
    setItem,
    read: k => store.get(k) ?? null,
    restore: () => {
      if (original) {
        Object.defineProperty(globalThis, 'localStorage', original);
      } else {
        delete (globalThis as { localStorage?: Storage }).localStorage;
      }
    },
  };
};
