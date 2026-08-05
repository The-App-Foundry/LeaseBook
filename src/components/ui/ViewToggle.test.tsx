import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterGridContext } from '../../context/FilterGridContext';
import type { ViewMode } from '../../context/FilterGridContext';
import ViewToggle from './ViewToggle';
import { createFilterGridValue } from '../../test/filterGridValue';

// ViewToggle imports the context barrel, which loads @tauri-apps/api/core.
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

const renderToggle = (viewMode: ViewMode, setViewMode = vi.fn()) => {
  render(
    <FilterGridContext.Provider value={createFilterGridValue({ viewMode, setViewMode })}>
      <ViewToggle />
    </FilterGridContext.Provider>,
  );
  return { setViewMode };
};

const cardsButton = () => screen.getByRole('button', { name: 'Cards' });
const listButton = () => screen.getByRole('button', { name: 'List' });

describe('ViewToggle', () => {
  it('exposes both segments inside a labelled group', () => {
    renderToggle('cards');

    expect(screen.getByRole('group', { name: 'View mode' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByText('Cards')).not.toBeInTheDocument();
    expect(screen.queryByText('List')).not.toBeInTheDocument();
  });

  it('marks Cards pressed and List unpressed in cards mode', () => {
    renderToggle('cards');

    expect(cardsButton()).toHaveAttribute('aria-pressed', 'true');
    expect(listButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks List pressed and Cards unpressed in list mode', () => {
    renderToggle('list');

    expect(listButton()).toHaveAttribute('aria-pressed', 'true');
    expect(cardsButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('requests list mode when List is clicked', async () => {
    const user = userEvent.setup();
    const { setViewMode } = renderToggle('cards');

    await user.click(listButton());

    expect(setViewMode).toHaveBeenCalledTimes(1);
    expect(setViewMode).toHaveBeenCalledWith('list');
  });

  it('requests cards mode when Cards is clicked', async () => {
    const user = userEvent.setup();
    const { setViewMode } = renderToggle('list');

    await user.click(cardsButton());

    expect(setViewMode).toHaveBeenCalledTimes(1);
    expect(setViewMode).toHaveBeenCalledWith('cards');
  });

  it('still reports the already-active mode when its own segment is clicked', () => {
    // Idempotent by design: the toggle does not guard against re-selecting the
    // active mode, and the context write is a no-op state set.
    const setViewMode = vi.fn();
    renderToggle('cards', setViewMode);

    cardsButton().click();

    expect(setViewMode).toHaveBeenCalledWith('cards');
  });

  it('is reachable and operable by keyboard', async () => {
    const user = userEvent.setup();
    const { setViewMode } = renderToggle('cards');

    await user.tab();
    expect(cardsButton()).toHaveFocus();

    await user.tab();
    expect(listButton()).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(setViewMode).toHaveBeenCalledWith('list');
  });

  it('renders real buttons, not divs, so type="button" cannot submit a form', () => {
    renderToggle('cards');

    expect(cardsButton()).toHaveAttribute('type', 'button');
    expect(listButton()).toHaveAttribute('type', 'button');
  });
});
