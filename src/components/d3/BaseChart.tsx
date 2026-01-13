'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

interface BaseChartProps {
    margin?: { top: number; right: number; bottom: number; left: number };
    children?: React.ReactNode;
    onReady: (
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => void;
}

const BaseChart = memo(({
    margin = { top: 20, right: 20, bottom: 20, left: 20 },
    children,
    onReady
}: BaseChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;

            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (dimensions && gRef.current) {
            // Calculate inner dimensions
            const innerWidth = dimensions.width - margin.left - margin.right;
            const innerHeight = dimensions.height - margin.top - margin.bottom;

            // Ensure we don't pass negative dimensions
            if (innerWidth > 0 && innerHeight > 0) {
                onReady(d3.select(gRef.current), { width: innerWidth, height: innerHeight });
            }
        }
    }, [dimensions, margin, onReady]);

    return (
        <Container ref={containerRef}>
            <Svg ref={svgRef}>
                <g
                    ref={gRef}
                    transform={`translate(${margin.left},${margin.top})`}
                >
                    {children}
                </g>
            </Svg>
        </Container>
    );
});

BaseChart.displayName = 'BaseChart';

export default BaseChart;
