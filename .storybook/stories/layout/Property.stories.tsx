import type { Meta, StoryObj } from '@storybook/react-vite';
import { Property, GridContainer } from '../../../src/components/layout';

const meta = {
  title: 'Layout/Property',
  component: Property,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'Property data object with status, name, address, lease info, etc.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Property card component displaying property information with status badge, name, and address.',
      },
    },
  },
} satisfies Meta<typeof Property>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultData = {
  status: 'Qualified',
  name: 'Sample Property LLC',
  businessAddr: '123 Main St, City, ST 12345',
  leaseExpiration: '2026-12-31',
  decisionMaker: 'John Doe',
  size: '5,000 sq ft',
  note: 'Sample note',
};

export const Default: Story = {
  args: {
    data: defaultData,
  },
};

export const Qualified: Story = {
  args: {
    data: {
      ...defaultData,
      status: 'Qualified',
      name: 'Qualified Property Inc',
      businessAddr: '456 Oak Ave, Springfield, IL 62701',
    },
  },
};

export const Prospect: Story = {
  args: {
    data: {
      ...defaultData,
      status: 'Prospect',
      name: 'Prospect Business Center',
      businessAddr: '789 Pine Road, Chicago, IL 60601',
    },
  },
};

export const ActiveLease: Story = {
  args: {
    data: {
      ...defaultData,
      status: 'Active',
      name: 'Active Lease Property',
      businessAddr: '321 Elm Street, Boston, MA 02101',
      leaseExpiration: '2027-06-30',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Property with active lease (green border indicator)',
      },
    },
  },
};

export const ExpiringSoon: Story = {
  args: {
    data: {
      ...defaultData,
      status: 'Warning',
      name: 'Expiring Soon Property',
      businessAddr: '555 Maple Drive, Seattle, WA 98101',
      leaseExpiration: '2025-03-15',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Property with lease expiring soon (yellow border warning)',
      },
    },
  },
};

export const Expired: Story = {
  args: {
    data: {
      ...defaultData,
      status: 'Expired',
      name: 'Expired Lease Property',
      businessAddr: '999 Cedar Lane, Austin, TX 78701',
      leaseExpiration: '2024-01-01',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Property with expired lease (red border alert)',
      },
    },
  },
};

export const MultipleProperties: Story = {
  args: {
    data: defaultData
  },
  render: () => (
    <GridContainer>
      <Property
        data={{
          status: 'Qualified',
          name: 'Acme Industries',
          businessAddr: '100 Business Park Dr, Dallas, TX 75201',
          leaseExpiration: '2026-12-31',
          decisionMaker: 'Jane Smith',
          size: '10,000 sq ft',
          note: '',
        }}
      />
      <Property
        data={{
          status: 'Prospect',
          name: 'Tech Solutions Ltd',
          businessAddr: '200 Innovation Way, San Jose, CA 95101',
          leaseExpiration: '2025-09-30',
          decisionMaker: 'Bob Johnson',
          size: '7,500 sq ft',
          note: '',
        }}
      />
      <Property
        data={{
          status: 'Active',
          name: 'Retail Store Co',
          businessAddr: '300 Shopping Center Blvd, Miami, FL 33101',
          leaseExpiration: '2027-03-15',
          decisionMaker: 'Alice Williams',
          size: '15,000 sq ft',
          note: '',
        }}
      />
      <Property
        data={{
          status: 'Warning',
          name: 'Small Business Inc',
          businessAddr: '400 Commerce St, Portland, OR 97201',
          leaseExpiration: '2025-02-28',
          decisionMaker: 'Charlie Brown',
          size: '3,000 sq ft',
          note: '',
        }}
      />
      <Property
        data={{
          status: 'Expired',
          name: 'Old Tenant LLC',
          businessAddr: '500 Historic Ave, Philadelphia, PA 19101',
          leaseExpiration: '2023-12-31',
          decisionMaker: 'David Wilson',
          size: '8,000 sq ft',
          note: '',
        }}
      />
      <Property
        data={{
          status: 'Qualified',
          name: 'New Prospect Corp',
          businessAddr: '600 Future Lane, Denver, CO 80201',
          leaseExpiration: '2028-06-01',
          decisionMaker: 'Eva Martinez',
          size: '12,000 sq ft',
          note: '',
        }}
      />
    </GridContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple properties in a grid layout showing various status types',
      },
    },
  },
};
