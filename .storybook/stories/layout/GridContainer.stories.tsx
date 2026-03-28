import type { Meta, StoryObj } from '@storybook/react-vite';
import GridContainer from '../../../src/components/layout/GridContainer';
import Property from '../../../src/components/layout/Property';

const sampleProperty = {
  status: 'Active',
  name: 'Harbor View Apartments',
  businessAddr: '12 Harbor St, Portland, OR',
  leaseExpiration: '2025-05-01',
  leaseManager: 'John Smith',
  size: '2,100 sqft',
  note: 'Recently renovated',
};

const meta = {
  title: 'Layout/GridContainer',
  component: GridContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive grid layout container using CSS Grid with auto-fill and minmax(220px, 1fr). Uses --spacing CSS variable for gap.',
      },
    },
  },
} satisfies Meta<typeof GridContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    children: null,
  },
};

export const WithCards: Story = {
  args: {
    children: (
      <>
        <Property data={sampleProperty} />
        <Property data={{ ...sampleProperty, name: 'Corner Loft' }} />
        <Property data={{ ...sampleProperty, name: 'Riverside Suite' }} />
        <Property data={{ ...sampleProperty, name: 'Downtown Studio' }} />
      </>
    ),
  },
};

export const ManyItems: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 12 }, (_, i) => (
          <Property
            key={i}
            data={{
              ...sampleProperty,
              name: `Property ${i + 1}`,
              businessAddr: `Address ${i + 1}`,
              leaseManager: `Contact ${i + 1}`,
            }}
          />
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the responsive grid behavior with 12 items. Grid automatically adjusts columns based on container width.',
      },
    },
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <Property
            key={i}
            data={{
              ...sampleProperty,
              name: `Card ${i + 1}`,
              note: `Sample content for card ${i + 1}`,
            }}
          />
        ))}
      </>
    ),
  },
};
