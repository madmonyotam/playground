'use client';

import styled from 'styled-components';

export const PageContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
`;
