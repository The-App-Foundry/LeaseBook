import type { Meta, StoryObj } from '@storybook/react-vite';
import Header from '../../../src/components/layout/Header';

const meta = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fixed header component with logo, search bar, and action button. Uses CSS variable --app-header-height (72px).',
      },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
  render: () => (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--app-header-height)', padding: '20px' }}>
        <h1>Page Content</h1>
        <p>
          The header is fixed at the top. This content area uses padding-top to offset the header
          height.
        </p>
      </div>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the header integrates with page content using the --app-header-height CSS variable',
      },
    },
  },
};
