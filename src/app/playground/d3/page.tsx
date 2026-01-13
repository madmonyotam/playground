'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import BarChartExample from '@/components/d3/BarChartExample';
import CircleChartExample from '@/components/d3/CircleChartExample';
import DistributionChartExample from '@/components/d3/DistributionChartExample';

// Helper types for the examples map
type ExampleComponent = React.FC;

interface ExampleDefinition {
  label: string;
  component: ExampleComponent;
}

// Define the examples map
const EXAMPLES: Record<string, ExampleDefinition> = {
  bar: {
    label: 'Bar Chart',
    component: BarChartExample,
  },
  circle: {
    label: 'Circle Chart',
    component: CircleChartExample,
  },
  distribution: {
    label: 'Distribution Chart',
    component: DistributionChartExample,
  },
};

const PageContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.shadows?.sm || '2px 0 5px rgba(0,0,0,0.1)'};
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const SidebarHeader = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography?.fontFamily?.heading};
`;

const ExampleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ExampleItem = styled.li<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '4px'};
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.typography?.fontFamily?.body};

  &:hover {
    background-color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.background};
      opacity: ${({ $active }) => ($active ? 1 : 0.8)};
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

export default function D3Playground() {
  const [activeKey, setActiveKey] = useState<string>('bar');

  const ActiveComponent = EXAMPLES[activeKey]?.component || (() => <div>Select an example</div>);

  return (
    <PageContainer>
      <Sidebar>
        <SidebarHeader>D3 Examples</SidebarHeader>
        <ExampleList>
          {Object.entries(EXAMPLES).map(([key, { label }]) => (
            <ExampleItem
              key={key}
              $active={activeKey === key}
              onClick={() => setActiveKey(key)}
            >
              {label}
            </ExampleItem>
          ))}
        </ExampleList>
      </Sidebar>
      <MainContent>
        <ActiveComponent />
      </MainContent>
    </PageContainer>
  );
}
