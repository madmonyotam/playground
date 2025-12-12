'use client';

import styled, { css } from 'styled-components';

export const Heading = styled.h1<{ variant?: 'h1' | 'h2' | 'h3' | 'h4' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
  margin-bottom: 0.5em;

  ${({ variant }) => variant === 'h1' && css`
    font-size: 2.5rem; // Desktop size, mobile could be smaller
    @media (max-width: 768px) { font-size: 2rem; }
  `}

  ${({ variant }) => variant === 'h2' && css`
    font-size: 2rem;
    @media (max-width: 768px) { font-size: 1.75rem; }
  `}

  ${({ variant }) => variant === 'h3' && css`
    font-size: 1.5rem;
  `}
  
  ${({ variant }) => (variant === 'h4' || !variant) && css`
    font-size: 1.25rem;
  `}
`;

export const Text = styled.p<{ variant?: 'body' | 'caption' | 'small'; color?: 'primary' | 'secondary' | 'accent' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme, color }) => theme.colors.text[color || 'secondary']};
  line-height: 1.6;
  margin-bottom: 1em;

  ${({ variant }) => variant === 'body' && css`
    font-size: 1rem;
  `}

  ${({ variant }) => variant === 'caption' && css`
    font-size: 0.875rem;
  `}

  ${({ variant }) => variant === 'small' && css`
    font-size: 0.75rem;
  `}
`;
