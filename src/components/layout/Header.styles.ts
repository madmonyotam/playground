'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const HeaderContainer = styled.header`
  height: 72px;
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const Logo = styled(Link)`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints?.tablet || '768px'}) {
    display: none;
  }
`;

export const NavLink = styled(Link)`
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

export const MenuButton = styled(Button)`
  display: none;
  padding: 8px;
  
  @media (max-width: ${props => props.theme.breakpoints?.tablet || '768px'}) {
    display: flex;
  }
`;
