'use client';

import React, { useCallback } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';
import PlaygroundCard from './PlaygroundCard';

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
        <PlaygroundCard title="Circle Chart Example" height={500}>
            <BaseChart onReady={onReady} />
        </PlaygroundCard>
    );
};

export default CircleChartExample;
