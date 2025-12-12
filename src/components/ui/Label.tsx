'use client';

import styled from 'styled-components';

export const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  cursor: pointer;
`;
