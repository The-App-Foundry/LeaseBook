import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { SearchProvider } from './SearchContext';
import {
  FilterGridContext,
  FilterGridProvider,
  VIEW_MODE_STORAGE_KEY,
  unixToIso,
} from './FilterGridContext';
import { installLocalStorageStub, type LocalStorageStub } from '../test/localStorageStub';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const TestConsumer = () => {
  const { leases, loading, totalCount, setActiveStage, setSortDirection, viewMode, setViewMode } =
    useContext(FilterGridContext);

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="total-count">{totalCount}</div>
      <div data-testid="lease-name">{leases[0]?.name ?? 'none'}</div>
      <div data-testid="lease-names">{leases.map(lease => lease.name).join(',')}</div>
      <div data-testid="lease-stages">{leases.map(lease => lease.stage).join(',')}</div>
      <div data-testid="lease-primary-managers">
        {leases
          .map(lease => lease.managers.filter(m => m.isPrimary).map(m => m.name).join('/') || 'none')
          .join(',')}
      </div>
      <div data-testid="view-mode">{viewMode}</div>
      <button type="button" onClick={() => setSortDirection('desc')}>
        Sort descending
      </button>
      <button type="button" onClick={() => setActiveStage('contacted')}>
        Show contacted
      </button>
      <button type="button" onClick={() => setViewMode('list')}>
        Switch to list
      </button>
      <button type="button" onClick={() => setViewMode('cards')}>
        Switch to cards
      </button>
    </div>
  );
};

/**
 * Mirrors the real `DbLease` wire shape. `stage` is a non-null lowercase column
 * on the Rust side, so the fixture carries it — omitting it would exercise
 * `parseStage`'s fallback instead of the shape the app actually receives.
 */
const leaseRow = (
  id: number,
  name: string,
  expirationDate: number,
  stage: string = 'new',
) => ({
  id,
  name,
  address: `${id} Main St`,
  size: 2500,
  expiration_date: expirationDate,
  notes: null,
  misc_data: null,
  created_on: 1_700_000_000,
  stage,
  managers: [],
});

const STAGE_COUNTS_STUB = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  negotiating: 0,
  won: 0,
  lost: 0,
};

const renderProvider = () =>
  render(
    <SearchProvider>
      <FilterGridProvider>
        <TestConsumer />
      </FilterGridProvider>
    </SearchProvider>,
  );

describe('FilterGridProvider', () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
    // lease_stage_counts fetches independently of the paginated fetch (see
    // FilterGridContext) — stub it globally so per-test mocks only need to
    // cover leases_with_managers_paginated calls.
    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'lease_stage_counts') {
        return Promise.resolve(STAGE_COUNTS_STUB);
      }
      return Promise.resolve({ leases: [], total_count: 0 });
    });
  });

  it('loads flattened lease rows returned by Tauri', async () => {
    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'lease_stage_counts') {
        return Promise.resolve(STAGE_COUNTS_STUB);
      }
      return Promise.resolve({
        leases: [
          {
            ...leaseRow(1, 'Acme Office', 1_804_291_200, 'negotiating'),
            notes: 'Corner unit',
            managers: [
              {
                id: 7,
                name: 'Riley Stone',
                phone_numbers: '555-1234',
                email: 'riley@example.com',
                // SQLite INTEGER on the leases_managers join row, not a bool.
                is_primary: 0,
              },
              {
                id: 8,
                name: 'Dana Cole',
                phone_numbers: '555-9876',
                email: 'dana@example.com',
                is_primary: 1,
              },
            ],
          },
        ],
        total_count: 1,
      });
    });

    render(
      <SearchProvider>
        <FilterGridProvider>
          <TestConsumer />
        </FilterGridProvider>
      </SearchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    expect(screen.getByTestId('lease-name')).toHaveTextContent('Acme Office');
    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
    // The DB stage column survives the mapping instead of being re-derived.
    expect(screen.getByTestId('lease-stages')).toHaveTextContent('negotiating');
    // is_primary is INTEGER 0/1; only the 1 becomes isPrimary: true.
    expect(screen.getByTestId('lease-primary-managers')).toHaveTextContent('Dana Cole');
    expect(invoke).toHaveBeenCalledWith('leases_with_managers_paginated', {
      page: 1,
      pageSize: 50,
      searchQuery: null,
    });
  });

  it('reorders loaded leases when sort direction changes without reloading data', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'lease_stage_counts') {
        return Promise.resolve(STAGE_COUNTS_STUB);
      }
      return Promise.resolve({
        leases: [
          leaseRow(1, 'Early Office', 1_700_000_000),
          leaseRow(2, 'Late Office', 1_800_000_000),
        ],
        total_count: 2,
      });
    });

    render(
      <SearchProvider>
        <FilterGridProvider>
          <TestConsumer />
        </FilterGridProvider>
      </SearchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
    expect(screen.getByTestId('lease-names')).toHaveTextContent('Early Office,Late Office');

    const paginatedCallsBeforeSort = vi
      .mocked(invoke)
      .mock.calls.filter(([command]) => command === 'leases_with_managers_paginated').length;

    await user.click(screen.getByRole('button', { name: 'Sort descending' }));

    expect(screen.getByTestId('lease-names')).toHaveTextContent('Late Office,Early Office');

    const paginatedCallsAfterSort = vi
      .mocked(invoke)
      .mock.calls.filter(([command]) => command === 'leases_with_managers_paginated').length;
    expect(paginatedCallsAfterSort).toBe(paginatedCallsBeforeSort);
  });

  it('reloads leases with the selected stage when a filter is selected, without refetching pill counts', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation((command, args) => {
      if (command === 'lease_stage_counts') {
        return Promise.resolve(STAGE_COUNTS_STUB);
      }
      const stage = (args as { stage?: string } | undefined)?.stage;
      if (stage === 'contacted') {
        return Promise.resolve({
          leases: [leaseRow(1, 'Expired Office', 1_700_000_000)],
          total_count: 1,
        });
      }
      return Promise.resolve({
        leases: [
          leaseRow(1, 'Expired Office', 1_700_000_000),
          leaseRow(2, 'Active Office', 1_800_000_000),
        ],
        total_count: 2,
      });
    });

    render(
      <SearchProvider>
        <FilterGridProvider>
          <TestConsumer />
        </FilterGridProvider>
      </SearchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    const stageCountsCallsBeforeFilter = vi
      .mocked(invoke)
      .mock.calls.filter(([command]) => command === 'lease_stage_counts').length;

    await user.click(screen.getByRole('button', { name: 'Show contacted' }));

    await waitFor(() => expect(screen.getByTestId('lease-names')).toHaveTextContent('Expired Office'));
    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
    expect(invoke).toHaveBeenLastCalledWith('leases_with_managers_paginated', {
      page: 1,
      pageSize: 50,
      searchQuery: null,
      stage: 'contacted',
    });

    // Selecting a filter pill must not re-trigger the independent stage-counts fetch.
    const stageCountsCallsAfterFilter = vi
      .mocked(invoke)
      .mock.calls.filter(([command]) => command === 'lease_stage_counts').length;
    expect(stageCountsCallsAfterFilter).toBe(stageCountsCallsBeforeFilter);
  });
});

/**
 * `localStorage` is not functional in this jsdom config — see
 * `src/test/localStorageStub.ts` for the evidence and the reasoning. Without
 * the stub every assertion below would pass vacuously via the provider's own
 * `catch`, so the storage is installed explicitly before each render.
 */
describe('FilterGridProvider — viewMode persistence', () => {
  let storage: LocalStorageStub | null = null;

  beforeEach(() => {
    vi.mocked(invoke).mockReset();
    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'lease_stage_counts') return Promise.resolve(STAGE_COUNTS_STUB);
      return Promise.resolve({ leases: [], total_count: 0 });
    });
  });

  afterEach(() => {
    storage?.restore();
    storage = null;
  });

  // Canary. This is the sole justification for the stub: if the jsdom config
  // ever gains a working localStorage, this fails and the stub should go.
  it('confirms the real global is still unusable in this jsdom config', () => {
    expect(typeof localStorage).toBe('undefined');
  });

  it('defaults to cards when the key is absent', async () => {
    storage = installLocalStorageStub();

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
    expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
    expect(storage.getItem).toHaveBeenCalledWith(VIEW_MODE_STORAGE_KEY);
  });

  it('restores list mode from a previously stored value', async () => {
    storage = installLocalStorageStub({ [VIEW_MODE_STORAGE_KEY]: 'list' });

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
    expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
  });

  it('restores cards mode from a stored value', async () => {
    storage = installLocalStorageStub({ [VIEW_MODE_STORAGE_KEY]: 'cards' });

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
    expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
  });

  it.each(['grid', 'List', 'LIST', '', 'null', '{"mode":"list"}'])(
    'validates rather than casts a stored value — %j falls back to cards',
    async stored => {
      storage = installLocalStorageStub({ [VIEW_MODE_STORAGE_KEY]: stored });

      renderProvider();

      await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
      // A cast would surface the garbage verbatim; the guard replaces it.
      expect(screen.getByTestId('view-mode').textContent).toBe('cards');
      expect(storage?.getItem).toHaveBeenCalledWith(VIEW_MODE_STORAGE_KEY);
    },
  );

  it('writes through to storage when the mode changes', async () => {
    const user = userEvent.setup();
    storage = installLocalStorageStub();

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    await user.click(screen.getByRole('button', { name: 'Switch to list' }));

    expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
    expect(storage.setItem).toHaveBeenCalledWith(VIEW_MODE_STORAGE_KEY, 'list');
    expect(storage.read(VIEW_MODE_STORAGE_KEY)).toBe('list');

    await user.click(screen.getByRole('button', { name: 'Switch to cards' }));

    expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
    expect(storage.read(VIEW_MODE_STORAGE_KEY)).toBe('cards');
  });

  it('overwrites a garbage stored value on the next explicit change', async () => {
    const user = userEvent.setup();
    storage = installLocalStorageStub({ [VIEW_MODE_STORAGE_KEY]: 'grid' });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    await user.click(screen.getByRole('button', { name: 'Switch to list' }));

    expect(storage.read(VIEW_MODE_STORAGE_KEY)).toBe('list');
  });

  it('keeps the in-memory mode authoritative when storage throws', async () => {
    const user = userEvent.setup();
    storage = installLocalStorageStub();
    storage.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    await user.click(screen.getByRole('button', { name: 'Switch to list' }));

    expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
  });

  it('falls back to cards when reading storage throws', async () => {
    storage = installLocalStorageStub();
    storage.getItem.mockImplementation(() => {
      throw new DOMException('SecurityError');
    });

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));
    expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
  });

  it('uses the exported storage key, not a hand-written literal', () => {
    expect(VIEW_MODE_STORAGE_KEY).toBe('leasebook.viewMode');
  });
});

describe('unixToIso', () => {
  it('converts epoch SECONDS (not milliseconds) to YYYY-MM-DD', () => {
    expect(unixToIso(1_700_000_000)).toBe('2023-11-14');
    expect(unixToIso(0)).toBe('1970-01-01');
  });

  it('drops the time component', () => {
    expect(unixToIso(1_700_086_399)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
