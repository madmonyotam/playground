'use client';

import styled from 'styled-components';
import { Card } from '@/components/ui/Card';

export const StyledRecipeCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  
  &:hover img {
    transform: scale(1.05);
  }
`;

export const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
  border-radius: 16px 16px 0 0; /* Specified in design */
`;

export const CardImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
`;

export const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 70%, rgba(0,0,0,0.2) 100%); /* Inner vignette */
  pointer-events: none;
`;

export const CardContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const MetaTags = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

export const Tag = styled.span`
  background-color: ${({ theme }) => `${theme.colors.secondary}20`}; // 20% opacity using hex
  color: ${({ theme }) => theme.colors.secondary}; // Sage Green text
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 99px; // Capsule
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
`;

export const AuthorName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading}; /* Heritage feel */
  font-style: italic;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;
