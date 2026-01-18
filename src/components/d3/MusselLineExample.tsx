'use client';

import React, { useMemo } from 'react';
import styled from 'styled-components';
import MusselLineChart, { ScanData } from './MusselLineChart';
import PlaygroundCard from './PlaygroundCard';

const Container = styled.div`
  width: 100%;
  height: 400px;
  background-color: #0b1221; /* Dark background as in screenshot */
  padding: 1rem;
  border-radius: 8px;
`;

const ChartTitle = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  color: #fff;
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

const MusselLineExample = () => {
    const data = useMemo(() => generateMockData(6), []); // Max 10 bars constraint
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    return (
        <PlaygroundCard title="Mussel Line Monitoring">
            <Container>
                <ChartTitle>
                    {/* Could put global stats here if needed */}
                </ChartTitle>
                <div style={{ height: '300px' }}>
                    <MusselLineChart
                        data={data}
                        selectedLineId={selectedId}
                        onLineSelect={setSelectedId}
                    />
                </div>
                <Legend>
                    <LegendItem color="#00cc88">HEALTHY MUSSELS</LegendItem>
                    <LegendItem color="#3366cc">PARASITE LEVELS</LegendItem>
                </Legend>
            </Container>
        </PlaygroundCard>
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
