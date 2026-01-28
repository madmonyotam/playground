'use client';

import styled from 'styled-components';

export const PageContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding: 24px 0;
`;

export const HeroSection = styled.section`
  text-align: center;
  padding: 64px 24px;
  background: ${({ theme }) => theme.colors.surface}; // Fallback if no image
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: relative;
  overflow: hidden;
  
  /* Decorative background element */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 8px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;


