import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders correctly with default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    render(<SearchBar value="hello world" />);
    expect(screen.getByRole('searchbox')).toHaveValue('hello world');
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<SearchBar onChange={handleChange} />);
    
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'a');
    
    expect(handleChange).toHaveBeenCalledWith('a');
  });
});
