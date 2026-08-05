import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterGridContext } from '../../context/FilterGridContext';
import LeaseList from './LeaseList';
import { STAGE_COLORS, STAGE_ORDER } from '../../utils/stageColors';
import type { Lease } from '../../types/lease';
import {
  createFilterGridValue,
  createLease,
  createManager,
  isoInDays,
} from '../../test/filterGridValue';

// LeaseList pulls in the context barrel, which imports @tauri-apps/api/core at
// module load. Nothing here invokes a command, but the import must resolve.
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

/**
 * The `near`/`far` bands render a live day count, so an assertion like
 * `'43 days'` rots overnight without a fixed clock. Only `Date` is faked —
 * faking timers wholesale deadlocks `userEvent`.
 */
const FIXED_NOW = new Date('2026-07-24T12:00:00.000Z');

const EXPECTED_HEADERS = [
  'STAGE',
  'COMPANY',
  'LEASE EXPIRATION',
  'STATUS',
  'DECISION MAKER',
  'SIZE',
];

const renderList = (leases: Lease[], onPropertyClick?: (id: number) => void) =>
  render(
    <FilterGridContext.Provider value={createFilterGridValue({ leases })}>
      <LeaseList onPropertyClick={onPropertyClick} />
    </FilterGridContext.Provider>,
  );

/** Data rows only — `getAllByRole('row')` includes the `<thead>` row at index 0. */
const dataRows = () => screen.getAllByRole('row').slice(1);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LeaseList — table structure', () => {
  it('renders the six columns in the specified order', () => {
    renderList([createLease()]);

    const headers = screen.getAllByRole('columnheader').map(header => header.textContent);

    expect(headers).toEqual(EXPECTED_HEADERS);
    expect(headers[0]).toBe('STAGE');
    expect(headers[1]).toBe('COMPANY');
  });

  it('renders one row per lease', () => {
    renderList([
      createLease({ id: 1, name: 'Acme Office' }),
      createLease({ id: 2, name: 'Beta Works' }),
      createLease({ id: 3, name: 'Cedar Labs' }),
    ]);

    expect(dataRows()).toHaveLength(3);
    expect(screen.getByText('Acme Office')).toBeInTheDocument();
    expect(screen.getByText('Cedar Labs')).toBeInTheDocument();
  });

  it('renders the full stage word, never the abbreviation circle', () => {
    // The mock led each row with an `NW`/`CN`/`QL` avatar. It was deliberately
    // dropped; this asserts it does not creep back in.
    renderList(STAGE_ORDER.map((stage, index) => createLease({ id: index + 1, stage })));

    for (const stage of STAGE_ORDER) {
      expect(screen.queryByText(STAGE_COLORS[stage].abbr)).not.toBeInTheDocument();
    }

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Negotiating')).toBeInTheDocument();
  });

  it('renders the company name and address together in one cell', () => {
    renderList([createLease({ name: 'Acme Office', businessAddr: '400 Harbor Way' })]);

    expect(screen.getByText('Acme Office')).toBeInTheDocument();
    expect(screen.getByText('400 Harbor Way')).toBeInTheDocument();
  });
});

describe('LeaseList — STATUS column', () => {
  it('renders a pill for a lease inside the opportunity window', () => {
    renderList([createLease({ leaseExpiration: isoInDays(10) })]);

    expect(screen.getByText('OPP')).toBeInTheDocument();
  });

  it('renders plain day-count text for a lease in the near band', () => {
    renderList([createLease({ leaseExpiration: isoInDays(43) })]);

    expect(screen.getByText('43 days')).toBeInTheDocument();
    expect(screen.queryByText('OPP')).not.toBeInTheDocument();
  });

  it('renders plain day-count text for a lease in the far band', () => {
    renderList([createLease({ leaseExpiration: isoInDays(160) })]);

    expect(screen.getByText('160 days')).toBeInTheDocument();
  });

  it('renders RENEWED for a won lease even when the day count says OPP', () => {
    renderList([createLease({ stage: 'won', leaseExpiration: isoInDays(5) })]);

    expect(screen.getByText('RENEWED')).toBeInTheDocument();
    expect(screen.queryByText('OPP')).not.toBeInTheDocument();
  });

  it('renders LOST for a lost lease', () => {
    renderList([createLease({ stage: 'lost', leaseExpiration: isoInDays(5) })]);

    expect(screen.getByText('LOST')).toBeInTheDocument();
    expect(screen.queryByText('OPP')).not.toBeInTheDocument();
  });

  it('renders the em-dash placeholder in BOTH cells when there is no expiration', () => {
    // The context stores an ASCII '-' for a null date while the STATUS badge
    // uses an em dash, so rendering the raw value would put '-' and '—' side by
    // side in one row. LeaseList normalises the date cell; assert neither cell
    // leaks the ASCII hyphen.
    // A manager is supplied so the DECISION MAKER column does not also emit one.
    renderList([
      createLease({
        leaseExpiration: '-',
        managers: [createManager({ name: 'Dana Primary', isPrimary: true })],
      }),
    ]);

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });
});

describe('LeaseList — DECISION MAKER column', () => {
  it('shows the manager flagged as primary, not merely the first', () => {
    renderList([
      createLease({
        managers: [
          createManager({ id: 1, name: 'Alex First', isPrimary: false }),
          createManager({ id: 2, name: 'Dana Primary', isPrimary: true }),
        ],
      }),
    ]);

    expect(screen.getByText('Dana Primary')).toBeInTheDocument();
    expect(screen.queryByText('Alex First')).not.toBeInTheDocument();
  });

  it('falls back to the first manager when none is flagged primary', () => {
    renderList([
      createLease({
        managers: [
          createManager({ id: 1, name: 'Alex First', isPrimary: false }),
          createManager({ id: 2, name: 'Sam Second', isPrimary: false }),
        ],
      }),
    ]);

    expect(screen.getByText('Alex First')).toBeInTheDocument();
    expect(screen.queryByText('Sam Second')).not.toBeInTheDocument();
  });

  it('renders an em dash when the lease has no managers', () => {
    renderList([createLease({ managers: [], leaseExpiration: isoInDays(43) })]);

    // '43 days' occupies STATUS, so the only em dash on screen is this column.
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('ignores the joined leaseManager string in favour of the managers array', () => {
    renderList([
      createLease({
        leaseManager: 'Alex First, Dana Primary',
        managers: [createManager({ id: 2, name: 'Dana Primary', isPrimary: true })],
      }),
    ]);

    expect(screen.getByText('Dana Primary')).toBeInTheDocument();
    expect(screen.queryByText('Alex First, Dana Primary')).not.toBeInTheDocument();
  });
});

describe('LeaseList — SIZE column', () => {
  it('appends the unit to a bare number', () => {
    renderList([createLease({ size: '2500' })]);

    expect(screen.getByText('2500 sq ft')).toBeInTheDocument();
  });

  it('leaves an already-suffixed size untouched', () => {
    renderList([createLease({ size: '5,000 sq ft' })]);

    expect(screen.getByText('5,000 sq ft')).toBeInTheDocument();
  });

  it('renders zero when size is missing', () => {
    renderList([createLease({ size: undefined })]);

    expect(screen.getByText('0 sq ft')).toBeInTheDocument();
  });
});

describe('LeaseList — row activation', () => {
  it('fires onPropertyClick with the clicked lease id', async () => {
    const user = userEvent.setup();
    const onPropertyClick = vi.fn();

    renderList(
      [createLease({ id: 11, name: 'Acme Office' }), createLease({ id: 22, name: 'Beta Works' })],
      onPropertyClick,
    );

    await user.click(dataRows()[1]);

    expect(onPropertyClick).toHaveBeenCalledTimes(1);
    expect(onPropertyClick).toHaveBeenCalledWith(22);
  });

  it('activates a focused row on Enter', async () => {
    const user = userEvent.setup();
    const onPropertyClick = vi.fn();

    renderList([createLease({ id: 11 }), createLease({ id: 22 })], onPropertyClick);

    dataRows()[1].focus();
    await user.keyboard('{Enter}');

    expect(onPropertyClick).toHaveBeenCalledWith(22);
  });

  it('activates a focused row on Space', async () => {
    const user = userEvent.setup();
    const onPropertyClick = vi.fn();

    renderList([createLease({ id: 11 }), createLease({ id: 22 })], onPropertyClick);

    dataRows()[1].focus();
    await user.keyboard(' ');

    expect(onPropertyClick).toHaveBeenCalledWith(22);
  });

  it('ignores other keys', async () => {
    const user = userEvent.setup();
    const onPropertyClick = vi.fn();

    renderList([createLease({ id: 11 })], onPropertyClick);

    dataRows()[0].focus();
    await user.keyboard('{Escape}');
    await user.keyboard('a');

    expect(onPropertyClick).not.toHaveBeenCalled();
  });

  it('exposes every row to the keyboard', () => {
    renderList([createLease({ id: 1 }), createLease({ id: 2 })]);

    for (const row of dataRows()) {
      expect(row).toHaveAttribute('tabindex', '0');
    }
  });

  it('does not throw when no onPropertyClick handler is supplied', async () => {
    const user = userEvent.setup();

    renderList([createLease({ id: 11 })]);

    await user.click(dataRows()[0]);
    dataRows()[0].focus();
    await user.keyboard('{Enter}');

    expect(dataRows()).toHaveLength(1);
  });
});

describe('LeaseList — empty state', () => {
  it('announces "No properties" when there are no leases', () => {
    renderList([]);

    expect(screen.getByRole('status')).toHaveTextContent('No properties');
  });

  it('keeps the headers rendered so the table does not collapse', () => {
    renderList([]);

    expect(screen.getAllByRole('columnheader').map(h => h.textContent)).toEqual(EXPECTED_HEADERS);
    expect(dataRows()).toHaveLength(1);
  });

  it('spans the empty cell across all six columns', () => {
    renderList([]);

    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '6');
  });

  it('shows no empty state once leases arrive', () => {
    renderList([createLease()]);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('No properties')).not.toBeInTheDocument();
  });
});
