import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { SearchProvider } from './SearchContext';
import { FilterGridContext, FilterGridProvider } from './FilterGridContext';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const TestConsumer = () => {
  const { leases, loading, totalCount, setActiveStage, setSortDirection } =
    useContext(FilterGridContext);

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="total-count">{totalCount}</div>
      <div data-testid="lease-name">{leases[0]?.name ?? 'none'}</div>
      <div data-testid="lease-names">{leases.map(lease => lease.name).join(',')}</div>
      <button type="button" onClick={() => setSortDirection('desc')}>
        Sort descending
      </button>
      <button type="button" onClick={() => setActiveStage('Contacted')}>
        Show contacted
      </button>
    </div>
  );
};

const leaseRow = (id: number, name: string, expirationDate: number) => ({
  id,
  name,
  address: `${id} Main St`,
  size: 2500,
  expiration_date: expirationDate,
  notes: null,
  misc_data: null,
  created_on: 1_700_000_000,
  managers: [],
});

describe('FilterGridProvider', () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
  });

  it('loads flattened lease rows returned by Tauri', async () => {
    vi.mocked(invoke).mockResolvedValueOnce({
      leases: [
        {
          ...leaseRow(1, 'Acme Office', 1_804_291_200),
          notes: 'Corner unit',
          managers: [
            {
              id: 7,
              name: 'Riley Stone',
              phone_numbers: '555-1234',
              email: 'riley@example.com',
            },
          ],
        },
      ],
      total_count: 1,
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
    expect(invoke).toHaveBeenCalledWith('leases_with_managers_paginated', {
      page: 1,
      pageSize: 50,
      searchQuery: null,
    });
  });

  it('reorders loaded leases when sort direction changes without reloading data', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockResolvedValueOnce({
      leases: [
        leaseRow(1, 'Early Office', 1_700_000_000),
        leaseRow(2, 'Late Office', 1_800_000_000),
      ],
      total_count: 2,
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

    await user.click(screen.getByRole('button', { name: 'Sort descending' }));

    expect(screen.getByTestId('lease-names')).toHaveTextContent('Late Office,Early Office');
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it('reloads leases with the selected stage when a filter is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        leases: [
          leaseRow(1, 'Expired Office', 1_700_000_000),
          leaseRow(2, 'Active Office', 1_800_000_000),
        ],
        total_count: 2,
      })
      .mockResolvedValueOnce({
        leases: [leaseRow(1, 'Expired Office', 1_700_000_000)],
        total_count: 1,
      });

    render(
      <SearchProvider>
        <FilterGridProvider>
          <TestConsumer />
        </FilterGridProvider>
      </SearchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('loaded'));

    await user.click(screen.getByRole('button', { name: 'Show contacted' }));

    await waitFor(() => expect(screen.getByTestId('lease-names')).toHaveTextContent('Expired Office'));
    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
    expect(invoke).toHaveBeenLastCalledWith('leases_with_managers_paginated', {
      page: 1,
      pageSize: 50,
      searchQuery: null,
      stage: 'Contacted',
    });
  });
});
