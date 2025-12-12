'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.primary};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const RecipeHeader = styled.header`
  margin-bottom: 32px;
`;

// Title is replaced by Heading component usage, but we might keep container if needed
// SectionTitle is replaced by Heading

export const DetailSection = styled.section`
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

export const List = styled.ul`
  padding-left: 20px;
  
  li {
    margin-bottom: 8px;
  }
`;
