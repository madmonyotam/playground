'use client';

import styled from 'styled-components';

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const WorkspaceWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden; /* Prevent body scroll, handle inside panels */
`;

export const Content = styled.main`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background}; /* Or slightly different for contrast */
  overflow: auto;
  position: relative;
  /* Grid background from image can be added here later */
  background-image: 
    linear-gradient(${({ theme }) => theme.colors.border} 1px, transparent 1px),
    linear-gradient(90deg, ${({ theme }) => theme.colors.border} 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
`;
