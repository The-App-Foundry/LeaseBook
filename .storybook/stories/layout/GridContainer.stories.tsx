import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import GridContainer from '../../../src/components/layout/GridContainer';
import { FilterGridContext } from '../../../src/context/FilterGridContext';
import type { Lease } from '../../../src/types/lease';
import {
  createFilterGridValue,
  createLease,
  createManager,
  type FilterGridValue,
} from '../../../src/test/filterGridValue';

/**
 * `GridContainer` takes no `children` and no lease data — it reads `leases`,
 * pagination and `viewMode` from `FilterGridContext` and renders `Property`
 * cards or `LeaseList` rows itself. The previous version of this file predated
 * that and passed `children`, which does not exist on its props.
 *
 * Stories therefore drive the component through a context decorator; `args`
 * carry only the four real optional callbacks.
 */

const SAMPLE_LEASES: Lease[] = [
  createLease({
    id: 1,
    stage: 'negotiating',
    name: 'Harbor View Apartments',
    businessAddr: '12 Harbor St, Portland, OR',
    leaseExpiration: '2026-08-14',
    size: '2100',
    note: 'Recently renovated',
    managers: [createManager({ id: 11, name: 'John Smith', isPrimary: true })],
  }),
  createLease({
    id: 2,
    stage: 'contacted',
    name: 'Corner Loft',
    businessAddr: '88 Market Ave, Portland, OR',
    leaseExpiration: '2026-11-30',
    size: '4500',
    managers: [
      createManager({ id: 21, name: 'Ada Reyes' }),
      createManager({ id: 22, name: 'Priya Nair', isPrimary: true }),
    ],
  }),
  createLease({
    id: 3,
    stage: 'won',
    name: 'Riverside Suite',
    businessAddr: '4 River Rd, Portland, OR',
    leaseExpiration: '2027-03-01',
    size: '9800',
    managers: [createManager({ id: 31, name: 'Marcus Webb', isPrimary: true })],
  }),
  createLease({
    id: 4,
    stage: 'lost',
    name: 'Downtown Studio',
    businessAddr: '900 Center Blvd, Portland, OR',
    leaseExpiration: '2026-09-09',
    size: '1200',
    managers: [],
  }),
];

const manyLeases = (count: number): Lease[] =>
  Array.from({ length: count }, (_, i) => {
    const template = SAMPLE_LEASES[i % SAMPLE_LEASES.length];
    return createLease({
      ...template,
      id: 100 + i,
      name: `Property ${i + 1}`,
      businessAddr: `Address ${i + 1}`,
    });
  });

/** Wrap a story in a fully-populated context value. */
const withGrid = (overrides: Partial<FilterGridValue>): Decorator[] => {
  const value = createFilterGridValue(overrides);
  return [
    Story => (
      <FilterGridContext.Provider value={value}>
        <Story />
      </FilterGridContext.Provider>
    ),
  ];
};

const meta = {
  title: 'Layout/GridContainer',
  component: GridContainer,
  tags: ['autodocs'],
  args: {
    onPropertyClick: () => {},
    onPropertyEdit: () => {},
    onPropertyDelete: () => {},
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shared shell for both view modes. Renders `Property` cards or the `LeaseList` table ' +
          'depending on `viewMode`, with the pagination bar and the "Create New Lease" footer ' +
          'kept common to both. All data comes from `FilterGridContext`.',
      },
    },
  },
} satisfies Meta<typeof GridContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: withGrid({ leases: [], totalCount: 0 }),
};

export const Cards: Story = {
  decorators: withGrid({
    leases: SAMPLE_LEASES,
    totalCount: SAMPLE_LEASES.length,
    viewMode: 'cards',
  }),
};

export const List: Story = {
  decorators: withGrid({
    leases: SAMPLE_LEASES,
    totalCount: SAMPLE_LEASES.length,
    viewMode: 'list',
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The tabular view: STAGE, COMPANY, LEASE EXPIRATION, STATUS, DECISION MAKER, SIZE. ' +
          'STATUS comes from the shared `getExpirationMeta` ruleset, so a row and its card ' +
          'always agree.',
      },
    },
  },
};

export const WithNewPropertyAction: Story = {
  args: {
    onNewProperty: () => {},
  },
  decorators: withGrid({ leases: SAMPLE_LEASES, totalCount: SAMPLE_LEASES.length }),
};

export const ManyItems: Story = {
  decorators: withGrid({ leases: manyLeases(12), totalCount: 12 }),
  parameters: {
    docs: {
      description: {
        story:
          'Twelve cards, showing the responsive auto-fill grid. Columns adjust to container width.',
      },
    },
  },
};

export const Paginated: Story = {
  decorators: withGrid({
    leases: manyLeases(25),
    totalCount: 412,
    currentPage: 4,
    pageSize: 25,
    totalPages: 17,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Page 4 of 17, exercising the ellipsis logic in the pagination control.',
      },
    },
  },
};
