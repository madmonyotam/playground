'use client';

import styled, { css } from 'styled-components';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  border: 1px solid transparent;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  /* Sizes */
  ${({ size }) => size === 'sm' && css`
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  `}

  ${({ size }) => (size === 'md' || !size) && css`
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
  `}

  ${({ size }) => size === 'lg' && css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `}

  /* Variants */
  ${({ variant, theme }) => (variant === 'primary' || !variant) && css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text.inverse};
    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(0);
    }
  `}

  ${({ variant, theme }) => variant === 'secondary' && css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.text.inverse};
    &:hover {
      filter: brightness(1.1);
    }
  `}

  ${({ variant, theme }) => variant === 'outline' && css`
    background-color: transparent;
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    &:hover {
      background-color: ${theme.colors.background}; // slightly opaque
    }
  `}
`;
