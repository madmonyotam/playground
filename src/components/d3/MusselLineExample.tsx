'use client';

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import MusselLineChart, { ScanData } from './MusselLineChart';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '../layout/PortalToPanel';
import {
    ControlsContainer,
    ControlSection,
    Label,
    ButtonGroup,
    ControlButton
} from './controls/ControlWidgets';

// Wrapper to add the specific grid background and layout for this chart within the PlaygroundCard
// We replace the outer "Container" with this inner specific wrapper.
const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  /* Grid pattern overlay specific to this chart example */
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.8rem;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background-color: ${props => props.color};
    border-radius: 2px;
  }
`;

type ColorTheme = {
    name: string;
    colors: {
        healthy: string;
        parasite: string;
    }
};

const THEMES: ColorTheme[] = [
    { name: 'Default', colors: { healthy: '#00cc88', parasite: '#3366cc' } },
    { name: 'Sunset', colors: { healthy: '#f59e0b', parasite: '#ef4444' } },
    { name: 'Ocean', colors: { healthy: '#06b6d4', parasite: '#3b82f6' } },
];

const MusselLineExample = () => {
    const [regenerateCount, setRegenerateCount] = useState(0);
    const data = useMemo(() => generateMockData(8), [regenerateCount]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTheme, setActiveTheme] = useState<ColorTheme>(THEMES[0]);

    return (
        <>
            <PortalToPanel>
                <ControlsContainer>
                    <ControlSection>
                        <Label>Data Options</Label>
                        <ButtonGroup>
                            <ControlButton
                                $active={false}
                                onClick={() => setRegenerateCount(c => c + 1)}
                            >
                                Regenerate Data
                            </ControlButton>
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Color Palette</Label>
                        <ButtonGroup>
                            {THEMES.map(theme => (
                                <ControlButton
                                    key={theme.name}
                                    $active={activeTheme.name === theme.name}
                                    onClick={() => setActiveTheme(theme)}
                                >
                                    {theme.name}
                                </ControlButton>
                            ))}
                        </ButtonGroup>
                    </ControlSection>

                    <ControlSection>
                        <Label>Selection</Label>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0.5rem 0' }}>
                            {selectedId ? `Selected: ${selectedId}` : 'No line selected (Click a bar)'}
                        </div>
                        {selectedId && (
                            <ButtonGroup>
                                <ControlButton
                                    $active={false}
                                    onClick={() => setSelectedId(null)}
                                >
                                    Clear Selection
                                </ControlButton>
                            </ButtonGroup>
                        )}
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>

            {/* Main Content Area */}
            <div style={{ height: '100%', width: '100%' }}>
                <PlaygroundCard title="Mussel Line Performance">
                    <ChartWrapper>
                        <MusselLineChart
                            data={data}
                            selectedLineId={selectedId}
                            onLineSelect={setSelectedId}
                            colors={activeTheme.colors}
                        />
                        <Legend>
                            <LegendItem color={activeTheme.colors.healthy}>HEALTHY MUSSELS</LegendItem>
                            <LegendItem color={activeTheme.colors.parasite}>PARASITE LEVELS</LegendItem>
                        </Legend>
                    </ChartWrapper>
                </PlaygroundCard>
            </div>
        </>
    );
};

export default MusselLineExample;

// Helper to generate mock data
function generateMockData(count: number): ScanData[] {
    return Array.from({ length: count }, (_, i) => {
        const lineId = `L-0${i + 1}`;
        const totalCount = 5000 + Math.random() * 5000;
        const bluePct = 0.1 + Math.random() * 0.4; // 10% to 50% parasites

        return {
            customer_id: 'cust_1',
            farm_id: 'farm_1',
            line_id: lineId,
            scan_date: '2023-10-27',
            scan_processing_date: '2023-10-28',
            pipeline_version: '1.0.0',
            latitude: 0,
            longitude: 0,
            length_stats: {
                min: 20,
                avg: 65 + Math.random() * 10,
                max: 120
            },
            width_stats: {
                min: 10,
                avg: 30,
                max: 50
            },
            count_statistics: {
                total_mussel_count_per_m: {
                    average: totalCount,
                    std: 100
                },
                green_mussel_count_per_m: {
                    average: totalCount * (1 - bluePct),
                    std: 100
                },
                blue_mussel_count_per_m: {
                    average: totalCount * bluePct,
                    std: 50
                },
                blue_mussel_percentage_average: bluePct
            }
        };
    });
}
