'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarContainer = styled.aside`
  width: 260px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  height: 100%;
`;

const SearchContainer = styled.div`
  padding: 0 1rem 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.text.accent};
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  padding: 0 1.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.colors.text.accent : theme.colors.text.primary};
  background-color: ${({ $active, theme }) => $active ? `${theme.colors.text.accent}15` : 'transparent'};
  border-left: 3px solid ${({ $active, theme }) => $active ? theme.colors.text.accent : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.text.accent}08`};
  }
  
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
`;

const NavItemLink = styled(Link) <{ $active?: boolean }>`
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.colors.text.accent : theme.colors.text.primary};
  background-color: ${({ $active, theme }) => $active ? `${theme.colors.text.accent}15` : 'transparent'};
  border-left: 3px solid ${({ $active, theme }) => $active ? theme.colors.text.accent : 'transparent'};
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.text.accent}08`};
  }
  
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
`;

export const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/playground/d3' && pathname === '/playground/d3') return true;
    if (path !== '/playground/d3' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <SidebarContainer>
      <SearchContainer>
        <SearchInput placeholder="Search components..." />
      </SearchContainer>

      <NavSection>
        <SectionTitle>D3 Examples</SectionTitle>
        <NavItemLink href="/playground/d3/bar-chart" $active={isActive('/playground/d3/bar-chart')}>Bar Chart</NavItemLink>
        <NavItemLink href="/playground/d3/circle-chart" $active={isActive('/playground/d3/circle-chart')}>Circle Chart</NavItemLink>
        <NavItemLink href="/playground/d3/distribution" $active={isActive('/playground/d3/distribution')}>Distribution Chart</NavItemLink>
        <NavItemLink href="/playground/d3" $active={isActive('/playground/d3')}>Mussel Line Monitor</NavItemLink>
      </NavSection>

      <NavSection>
        <SectionTitle>Advanced Visuals</SectionTitle>
        <NavItem>Geospatial Maps</NavItem>
      </NavSection>
    </SidebarContainer>
  );
};
