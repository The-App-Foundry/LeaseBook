import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { SearchContext, SearchProvider } from './SearchContext';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

const TestComponent = () => {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  return (
    <div>
      <div data-testid="query-display">{searchQuery}</div>
      <button onClick={() => setSearchQuery('test query')}>Set Query</button>
    </div>
  );
};

describe('SearchContext', () => {
  it('provides default empty search query', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    expect(screen.getByTestId('query-display')).toHaveTextContent('');
  });

  it('updates search query when setSearchQuery is called', async () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'Set Query' }));
    expect(screen.getByTestId('query-display')).toHaveTextContent('test query');
  });
});
