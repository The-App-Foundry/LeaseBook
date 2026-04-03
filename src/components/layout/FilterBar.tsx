import styled from 'styled-components';
import { Card, Dropdown, Sort, Badge, Button } from '../ui';
import { Funnel as _Funnel } from 'lucide-react';

const Wrapper = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  box-sizing: border-box;

  &.inner {
    padding: 0;
    height: 100%;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 25px;
  font-weight: 600;
`;

const Funnel = styled(_Funnel)`
  stroke-width: 1.5px;
  margin-right: 5px;
`;

const FilterBar = () => (
  <Wrapper>
    <Card $width="1600px" $height="77px">
      <Wrapper className="inner">
        <Funnel />
        <Label>Filter:</Label>
        <Button className="filter">All Properties</Button>
        <Button className="filter">
          <Badge className="emerald">Q</Badge>Qualified
        </Button>
        <Button className="filter">
          <Badge className="gray">P</Badge>Prospects
        </Button>
      </Wrapper>
      <Wrapper className="inner">
        <Sort />
        <Dropdown
          buttonLabel="Sort by"
          items={[{ title: 'Expiration' }, { title: 'Address' }, { title: 'Type' }]}
        />
      </Wrapper>
    </Card>
  </Wrapper>
);

export default FilterBar;
