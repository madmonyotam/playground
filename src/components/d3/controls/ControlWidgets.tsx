'use client';

import styled from 'styled-components';

export const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
`;

export const ControlSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
`;

export const Label = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
`;

export const ButtonGroup = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  width: fit-content;
`;

export const ControlButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#ffffff' : theme.colors.text.primary};
  border: none;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};

  &:last-child {
      border-right: none;
  }

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : `${theme.colors.text.accent}15`};
  }
`;

// Reusable Widgets

interface RangeControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

const RangeInput = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const RangeControl = ({ label, value, onChange, min, max, step = 1, unit = '' }: RangeControlProps) => (
  <ControlSection>
    <Label>{label}: {value}{unit}</Label>
    <RangeInput
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </ControlSection>
);

interface ToggleControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
  }
  
    input {
        accent-color: ${({ theme }) => theme.colors.primary};
        width: 1rem;
        height: 1rem;
    }
`;

export const ToggleControl = ({ label, checked, onChange }: ToggleControlProps) => (
  <ControlSection>
    <ToggleLabel>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </ToggleLabel>
  </ControlSection>
);

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput = styled.input`
    width: 60px;
    height: 30px;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    cursor: pointer;
    background: none;
`;

export const ColorControl = ({ label, value, onChange }: ColorControlProps) => (
  <ControlSection>
    <Label>{label}</Label>
    <ColorInput
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </ControlSection>
);

