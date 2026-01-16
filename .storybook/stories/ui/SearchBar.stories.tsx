import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { userEvent, within, expect } from 'storybook/test';
import SearchBar from '../../../src/components/ui/SearchBar';

const meta = {
  title: 'UI/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current search value',
    },
    onChange: {
      description: 'Callback when search value changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search properties...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Sample search query',
    placeholder: 'Search...',
  },
};

export const Interactive: Story = {
  render: function InteractiveSearchBar() {
    const [value, setValue] = useState('');
    return (
      <div>
        <SearchBar value={value} onChange={setValue} placeholder="Type to search..." />
        <p style={{ marginTop: '16px' }}>Current value: {value || '(empty)'}</p>
      </div>
    );
  },
};

export const WithInteractionTest: Story = {
  render: function InteractiveForTest() {
    const [value, setValue] = useState('');
    return <SearchBar value={value} onChange={setValue} placeholder="Search properties..." />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('searchbox');

    await userEvent.type(searchInput, 'Test property', { delay: 100 });
    await expect(searchInput).toHaveValue('Test property');
  },
};
