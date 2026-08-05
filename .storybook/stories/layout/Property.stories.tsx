import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Property, GridContainer } from '../../../src/components/layout';
import { FilterGridContext } from '../../../src/context/FilterGridContext';
import type { Lease } from '../../../src/types/lease';
import { createFilterGridValue, createLease, createManager } from '../../../src/test/filterGridValue';

/**
 * `Lease.status` is a legacy client-side derivation (`'qualified' | 'prospect'`)
 * and is NOT rendered — the card shows `stage`. These stories vary `stage` and
 * `leaseExpiration`, which are what actually drive the badge, via the shared
 * `getExpirationMeta` ruleset.
 */

const meta = {
  title: 'Layout/Property',
  component: Property,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'A full `Lease`: id, stage, name, address, expiration, size, managers, note.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Property card. The expiration badge is resolved by `getExpirationMeta`, shared with ' +
          'the list view, so a card and its table row can never disagree.',
      },
    },
  },
} satisfies Meta<typeof Property>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultData: Lease = createLease({
  id: 1,
  stage: 'new',
  name: 'Sample Property LLC',
  businessAddr: '123 Main St, City, ST 12345',
  leaseExpiration: '2027-12-31',
  leaseManager: 'John Doe',
  size: '5,000 sq ft',
  note: 'Sample note',
  managers: [createManager({ id: 1, name: 'John Doe', isPrimary: true })],
});

export const Default: Story = {
  args: { data: defaultData },
};

export const Qualified: Story = {
  args: {
    data: createLease({
      ...defaultData,
      id: 2,
      stage: 'qualified',
      name: 'Qualified Property Inc',
      businessAddr: '456 Oak Ave, Springfield, IL 62701',
    }),
  },
};

export const Negotiating: Story = {
  args: {
    data: createLease({
      ...defaultData,
      id: 3,
      stage: 'negotiating',
      name: 'Prospect Business Center',
      businessAddr: '789 Pine Road, Chicago, IL 60601',
    }),
  },
};

export const Renewed: Story = {
  args: {
    data: createLease({
      ...defaultData,
      id: 4,
      stage: 'won',
      name: 'Renewed Lease Property',
      businessAddr: '321 Elm Street, Boston, MA 02101',
      leaseExpiration: '2028-06-30',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage `won` short-circuits the day count and always renders the RENEWED pill.',
      },
    },
  },
};

export const Lost: Story = {
  args: {
    data: createLease({
      ...defaultData,
      id: 5,
      stage: 'lost',
      name: 'Lost Lease Property',
      businessAddr: '999 Cedar Lane, Austin, TX 78701',
      leaseExpiration: '2027-01-01',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage `lost` short-circuits the day count and always renders the LOST pill.',
      },
    },
  },
};

export const NoExpirationOnRecord: Story = {
  args: {
    data: createLease({
      ...defaultData,
      id: 6,
      stage: 'contacted',
      name: 'Unknown Expiry Co',
      // The context writes an ASCII '-' when the DB date is null.
      leaseExpiration: '-',
    }),
  },
};

const MOCK_LEASES: Lease[] = [
  createLease({
    id: 1,
    stage: 'qualified',
    name: 'Acme Industries',
    businessAddr: '100 Business Park Dr, Dallas, TX 75201',
    leaseExpiration: '2027-12-31',
    leaseManager: 'Jane Smith',
    size: '10000',
    managers: [createManager({ id: 1, name: 'Jane Smith', isPrimary: true })],
  }),
  createLease({
    id: 2,
    stage: 'contacted',
    name: 'Tech Solutions Ltd',
    businessAddr: '200 Innovation Way, San Jose, CA 95101',
    leaseExpiration: '2026-09-30',
    leaseManager: 'Bob Johnson',
    size: '7500',
    managers: [createManager({ id: 2, name: 'Bob Johnson', isPrimary: true })],
  }),
  createLease({
    id: 3,
    stage: 'negotiating',
    name: 'Retail Store Co',
    businessAddr: '300 Shopping Center Blvd, Miami, FL 33101',
    leaseExpiration: '2027-03-15',
    leaseManager: 'Alice Williams',
    size: '15000',
    managers: [createManager({ id: 3, name: 'Alice Williams', isPrimary: true })],
  }),
  createLease({
    id: 4,
    stage: 'won',
    name: 'Small Business Inc',
    businessAddr: '400 Commerce St, Portland, OR 97201',
    leaseExpiration: '2026-08-28',
    leaseManager: 'Charlie Brown',
    size: '3000',
    managers: [createManager({ id: 4, name: 'Charlie Brown', isPrimary: true })],
  }),
  createLease({
    id: 5,
    stage: 'lost',
    name: 'Old Tenant LLC',
    businessAddr: '500 Historic Ave, Philadelphia, PA 19101',
    leaseExpiration: '2026-01-31',
    leaseManager: 'David Wilson',
    size: '8000',
    managers: [createManager({ id: 5, name: 'David Wilson', isPrimary: true })],
  }),
  createLease({
    id: 6,
    stage: 'new',
    name: 'New Prospect Corp',
    businessAddr: '600 Future Lane, Denver, CO 80201',
    leaseExpiration: '2029-06-01',
    leaseManager: 'Eva Martinez',
    size: '12000',
    managers: [createManager({ id: 6, name: 'Eva Martinez', isPrimary: true })],
  }),
];

/** `GridContainer` reads its rows from context, so the grid story supplies one. */
const withMockLeases: Decorator[] = [
  Story => (
    <FilterGridContext.Provider
      value={createFilterGridValue({ leases: MOCK_LEASES, totalCount: MOCK_LEASES.length })}
    >
      <Story />
    </FilterGridContext.Provider>
  ),
];

export const MultipleProperties: Story = {
  args: { data: defaultData },
  decorators: withMockLeases,
  render: () => <GridContainer onPropertyClick={() => {}} />,
  parameters: {
    docs: {
      description: {
        story: 'Six leases in the card grid, one per pipeline stage.',
      },
    },
  },
};
