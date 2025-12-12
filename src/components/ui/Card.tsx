'use client';

import styled from 'styled-components';

export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.border}; // Subtle border for definition
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  /* Hover effect for interactive cards */
  &:hover {
    // Only if it has an onClick or is anchor, but we can do generic for now
    // transform: translateY(-2px);
    // box-shadow: ${({ theme }) => theme.shadows.sm}; // slightly lifted? No, deeper shadow
  }
`;
