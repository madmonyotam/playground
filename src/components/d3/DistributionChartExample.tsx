'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import DistributionChart from './DistributionChart';
import PlaygroundCard from './PlaygroundCard';

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const Button = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text.inverse : theme.colors.text.primary};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.secondary};
  }
`;

const mockData = {
    length_histogram: {
        bin_size_5mm: Array.from({ length: 20 }, (_, i) => ({
            range: `${i * 5}-${(i + 1) * 5}`,
            percentage: Math.random() * 40 // Random data for demo
        })),
        bin_size_10mm: [
            { "range": "0-10", "percentage": 2 },
            { "range": "10-20", "percentage": 5 },
            { "range": "20-30", "percentage": 10 },
            { "range": "30-40", "percentage": 15 },
            { "range": "40-50", "percentage": 32 },
            { "range": "50-60", "percentage": 25 },
            { "range": "60-70", "percentage": 8 },
            { "range": "70-80", "percentage": 3 }
        ],
        bin_size_20mm: [
            { "range": "0-20", "percentage": 7 },
            { "range": "20-40", "percentage": 25 },
            { "range": "40-60", "percentage": 57 },
            { "range": "60-80", "percentage": 11 }
        ]
    },
    width_histogram: {
        bin_size_5mm: Array.from({ length: 15 }, (_, i) => ({
            range: `${i * 5}-${(i + 1) * 5}`,
            percentage: Math.random() * 30
        })),
        bin_size_10mm: [
            { "range": "0-10", "percentage": 5 },
            { "range": "10-20", "percentage": 15 },
            { "range": "20-30", "percentage": 45 },
            { "range": "30-40", "percentage": 25 },
            { "range": "40-50", "percentage": 10 }
        ],
        bin_size_20mm: [
            { "range": "0-20", "percentage": 20 },
            { "range": "20-40", "percentage": 70 },
            { "range": "40-60", "percentage": 10 }
        ]
    }
};

const DistributionChartExample = () => {
    const [category, setCategory] = useState('length_histogram');
    const [binSize, setBinSize] = useState('10mm');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const binSizeKey = `bin_size_${binSize}`;

    return (
        <PlaygroundCard title="Distribution Chart">
            <Controls>
                <ButtonGroup>
                    <Button
                        $active={category === 'length_histogram'}
                        onClick={() => setCategory('length_histogram')}
                    >
                        Length
                    </Button>
                    <Button
                        $active={category === 'width_histogram'}
                        onClick={() => setCategory('width_histogram')}
                    >
                        Width
                    </Button>
                </ButtonGroup>

                <ButtonGroup>
                    {['5mm', '10mm', '20mm'].map(size => (
                        <Button
                            key={size}
                            $active={binSize === size}
                            onClick={() => setBinSize(size)}
                        >
                            {size}
                        </Button>
                    ))}
                </ButtonGroup>

                <ButtonGroup>
                    <Button
                        $active={theme === 'dark'}
                        onClick={() => setTheme('dark')}
                    >
                        Dark
                    </Button>
                    <Button
                        $active={theme === 'light'}
                        onClick={() => setTheme('light')}
                    >
                        Light
                    </Button>
                </ButtonGroup>
            </Controls>

            <div style={{ height: '400px', width: '100%', background: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '8px', padding: '1rem', transition: 'background 0.3s' }}>
                <DistributionChart
                    dataSource={mockData}
                    category={category}
                    binSizeKey={binSizeKey}
                    theme={theme}
                    xAxisLabel={category === 'length_histogram' ? 'LENGTH (MM)' : 'WIDTH (MM)'}
                    primaryColor="#3b82f6"
                />
            </div>
        </PlaygroundCard>
    );
};

export default DistributionChartExample;
