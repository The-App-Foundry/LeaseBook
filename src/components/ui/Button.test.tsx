import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default primary variant class', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('applies destructive variant class', () => {
    render(<Button $variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
