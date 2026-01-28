'use client';

import React, { useState } from 'react';
import DistributionChart from './DistributionChart';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import {
    ControlsContainer,
    ControlSection,
    Label,
    ButtonGroup,
    ControlButton
} from './controls/ControlWidgets';

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
    const [gridLines, setGridLines] = useState(true);
    const [curveType, setCurveType] = useState<'monotoneX' | 'natural' | 'linear'>('monotoneX');
    const [barPadding, setBarPadding] = useState(0.2);

    const binSizeKey = `bin_size_${binSize}`;

    return (
        <>
            <PortalToPanel>
                <ControlsContainer>
                    <ControlSection>
                        <Label>Metric</Label>
                        <ButtonGroup>
                            <ControlButton
                                $active={category === 'length_histogram'}
                                onClick={() => setCategory('length_histogram')}
                            >
                                Length
                            </ControlButton>
                            <ControlButton
                                $active={category === 'width_histogram'}
                                onClick={() => setCategory('width_histogram')}
                            >
                                Width
                            </ControlButton>
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Bin Size</Label>
                        <ButtonGroup>
                            {['5mm', '10mm', '20mm'].map(size => (
                                <ControlButton
                                    key={size}
                                    $active={binSize === size}
                                    onClick={() => setBinSize(size)}
                                >
                                    {size}
                                </ControlButton>
                            ))}
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Theme Preview</Label>
                        <ButtonGroup>
                            <ControlButton
                                $active={theme === 'dark'}
                                onClick={() => setTheme('dark')}
                            >
                                Dark
                            </ControlButton>
                            <ControlButton
                                $active={theme === 'light'}
                                onClick={() => setTheme('light')}
                            >
                                Light
                            </ControlButton>
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Options</Label>
                        <ButtonGroup>
                            <ControlButton
                                $active={gridLines}
                                onClick={() => setGridLines(!gridLines)}
                            >
                                Grid: {gridLines ? 'On' : 'Off'}
                            </ControlButton>
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Interpolation</Label>
                        <ButtonGroup>
                            {['monotoneX', 'natural', 'linear'].map((type) => (
                                <ControlButton
                                    key={type}
                                    $active={curveType === type}
                                    onClick={() => setCurveType(type as any)}
                                >
                                    {type}
                                </ControlButton>
                            ))}
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Bar Padding: {barPadding.toFixed(1)}</Label>
                        <ButtonGroup>
                            <ControlButton $active={false} onClick={() => setBarPadding(Math.max(0, barPadding - 0.1))}>-</ControlButton>
                            <ControlButton $active={false} onClick={() => setBarPadding(Math.min(0.8, barPadding + 0.1))}>+</ControlButton>
                        </ButtonGroup>
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>

            <PlaygroundCard title="Distribution Chart">
                <div style={{ height: '400px', width: '100%', backgroundColor: theme === 'dark' ? '#0b1221' : '#fff' }}>
                    <DistributionChart
                        dataSource={mockData}
                        category={category}
                        binSizeKey={binSizeKey}
                        theme={theme}
                        xAxisLabel={category === 'length_histogram' ? 'LENGTH (MM)' : 'WIDTH (MM)'}
                        primaryColor="#3b82f6"
                        maxXTicks={10}
                        gridLines={gridLines}
                        curveType={curveType}
                        barPadding={barPadding}
                    />
                </div>
            </PlaygroundCard>
        </>
    );
};

export default DistributionChartExample;
