import { Card, Dropdown, Sort, Badge, Button } from '../ui';
import { Funnel } from 'lucide-react';

const FilterBar = () => (
  <div className="lb-filter-wrapper">
    <Card $width="1600px" $height="77px">
      <div className="lb-filter-inner">
        <Funnel style={{ strokeWidth: 1.5, marginRight: 5, flexShrink: 0 }} />
        <label className="lb-filter-label">Filter:</label>
        <Button className="filter">All Properties</Button>
        <Button className="filter">
          <span className="d-flex align-items-center gap-1">
            <Badge className="emerald">Q</Badge>Qualified
          </span>
        </Button>
        <Button className="filter">
          <span className="d-flex align-items-center gap-1">
            <Badge className="gray">P</Badge>Prospects
          </span>
        </Button>
      </div>
      <div className="lb-filter-inner">
        <Sort />
        <Dropdown
          buttonLabel="Sort by"
          items={[{ title: 'Expiration' }, { title: 'Address' }, { title: 'Type' }]}
        />
      </div>
    </Card>
  </div>
);

export default FilterBar;
