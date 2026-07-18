import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { invoke } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { FilterGridProvider, SearchProvider } from './context';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  confirm: vi.fn(),
}));

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

const renderApp = () =>
  render(
    <SearchProvider>
      <FilterGridProvider>
        <App />
      </FilterGridProvider>
    </SearchProvider>,
  );

describe('App list empty states', () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
  });

  it('shows an in-grid empty message for zero-result filters', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        leases: [leaseRow(1, 'Active Office', 1_800_000_000)],
        total_count: 1,
      })
      .mockResolvedValueOnce({
        leases: [],
        total_count: 0,
      });

    renderApp();

    await waitFor(() => expect(screen.getByText('Active Office')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Contacted/i }));

    await waitFor(() => expect(screen.getByText('No properties')).toBeInTheDocument());
    expect(screen.queryByText('No leases yet')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Properties/i })).toBeInTheDocument();
  });
});
