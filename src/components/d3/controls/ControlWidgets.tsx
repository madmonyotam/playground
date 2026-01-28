'use client';

import styled from 'styled-components';

export const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
`;

export const ControlSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
`;

export const Label = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
`;

export const ButtonGroup = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  width: fit-content;
`;

export const ControlButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#ffffff' : theme.colors.text.primary};
  border: none;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};

  &:last-child {
      border-right: none;
  }

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : `${theme.colors.text.accent}15`};
  }
`;
