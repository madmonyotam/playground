'use client';

import styled from 'styled-components';

export const ConfigContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: white; // explicit white as per original, or could use theme.colors.surface
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

export const Section = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
`;
