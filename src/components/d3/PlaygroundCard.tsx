'use client';

import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div<{ $height?: string | number }>`
  width: 100%;
  height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height || '100%')};
  border: 1px solid ${({ theme }) => theme.colors.border || '#eee'};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '8px'};
  background-color: ${({ theme }) => theme.colors.surface || '#fff'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TitleHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || '#eee'};
  background-color: ${({ theme }) => theme.colors.surface || '#fff'};
  display: flex;
  align-items: center;
`;

const TitleText = styled.h2`
  font-family: ${({ theme }) => theme.typography?.fontFamily?.heading || 'serif'};
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 1.2em;
    background-color: ${({ theme }) => theme.colors.primary || 'orange'};
    border-radius: 2px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  padding: 1rem;
`;

interface PlaygroundCardProps {
  title: string;
  children: React.ReactNode;
  height?: string | number;
}

const PlaygroundCard: React.FC<PlaygroundCardProps> = ({ title, children, height }) => {
  return (
    <CardContainer $height={height}>
      <TitleHeader>
        <TitleText>{title}</TitleText>
      </TitleHeader>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </CardContainer>
  );
};

export default PlaygroundCard;
