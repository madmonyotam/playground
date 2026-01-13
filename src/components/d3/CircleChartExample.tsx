'use client';

import React, { useCallback } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';
import styled from 'styled-components';

const ExampleContainer = styled.div`
  width: 100%;
  height: 500px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const CircleChartExample = () => {
    const onReady = useCallback((selection: d3.Selection<SVGGElement, unknown, null, undefined>, { width, height }: { width: number; height: number }) => {
        const data = [10, 20, 30, 40, 50];

        // Center the visualization
        const centerX = width / 2;
        const centerY = height / 2;

        const circles = selection.selectAll<SVGCircleElement, number>('circle')
            .data(data);

        circles.exit().remove();

        circles
            .transition().duration(1000)
            .attr('cx', (_, i) => centerX + (i - 2) * 60)
            .attr('cy', centerY)
            .attr('r', d => d);

        circles.enter()
            .append('circle')
            .attr('cx', (_, i) => centerX + (i - 2) * 60)
            .attr('cy', centerY)
            .attr('r', 0)
            .attr('fill', 'orange')
            .style('opacity', 0.7)
            .transition().duration(1000)
            .attr('r', d => d);

    }, []);

    return (
        <ExampleContainer>
            <h3>Circle Chart Example</h3>
            <BaseChart onReady={onReady} />
        </ExampleContainer>
    );
};

export default CircleChartExample;
