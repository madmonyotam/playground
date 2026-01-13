'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div<{ isOpen: boolean }>`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, isOpen }) => isOpen ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: ${({ theme, isOpen }) => isOpen ? `0 0 0 2px ${theme.colors.primary}20` : 'none'};

  /* Custom Arrow */
  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%) ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    width: 10px;
    height: 6px;
    background-color: ${({ theme }) => theme.colors.text.secondary};
    -webkit-mask: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center;
    mask: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
    mask-size: contain;
    transition: transform 0.2s ease;
  }
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.card};
  z-index: 1000;
  overflow: hidden;
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  transform: translateY(${({ isOpen }) => isOpen ? '0' : '-10px'});
  pointer-events: ${({ isOpen }) => isOpen ? 'auto' : 'none'};
  transition: all 0.2s ease;
  max-height: 200px;
  overflow-y: auto;
`;

const Option = styled.div<{ isSelected: boolean }>`
  padding: 10px 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: 1rem;
  color: ${({ theme, isSelected }) => isSelected ? theme.colors.primary : theme.colors.text.primary};
  background-color: ${({ theme, isSelected }) => isSelected ? `${theme.colors.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }
`;

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
}

export function Select({ value, onChange, options, placeholder = 'Select...', style }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <SelectContainer ref={containerRef} style={style}>
      <SelectTrigger isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? selectedOption.label : placeholder}
      </SelectTrigger>
      <Dropdown isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </SelectContainer>
  );
}
