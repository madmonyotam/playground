'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

export const PremiumLock = styled.div`
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 48px;
  border-radius: 8px;
  margin-top: 32px;
`;

export const LockIcon = styled.span`
  font-size: 3rem;
  margin-bottom: 32px;
  display: block;
`;

export const UpgradeButton = styled(Link)`
  display: inline-block;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 16px;
  text-decoration: none;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const ChefInterface = styled.div`
  margin-top: 32px;
  text-align: left;
`;

export const ResultArea = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;
