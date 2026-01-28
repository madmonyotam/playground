'use client';

import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.aside`
  width: 300px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const PanelContent = styled.div`
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
`;

export const PropertiesPanel = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>PROPERTIES</PanelTitle>
      </PanelHeader>
      <PanelContent id="properties-panel-root">
        {/* Controls will be injected here via Portal or children */}
        {children}
      </PanelContent>
    </PanelContainer>
  );
};
