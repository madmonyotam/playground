'use client';

import React, { useCallback } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';
import PlaygroundCard from './PlaygroundCard';

const BarChartExample = () => {
    const onReady = useCallback((selection: d3.Selection<SVGGElement, unknown, null, undefined>, { width, height }: { width: number; height: number }) => {
        // Data
        const data = [10, 40, 30, 70, 50, 20, 90, 60];

        // Scales
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map((_, i) => i.toString()))
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Bars: Join
        const bars = selection.selectAll<SVGRectElement, number>('rect')
            .data(data);

        // Bars: Exit
        bars.exit().remove();

        // Bars: Update
        bars
            .transition().duration(500)
            .attr('x', (_, i) => x(i.toString())!)
            .attr('y', d => y(d))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d))
            .attr('fill', 'steelblue');

        // Bars: Enter
        bars.enter()
            .append('rect')
            .attr('x', (_, i) => x(i.toString())!)
            .attr('y', height) // Start from bottom for animation
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', 'steelblue')
            .transition().duration(500)
            .attr('y', d => y(d))
            .attr('height', d => height - y(d));

        // Axes (optional, simple implementation)
        // Remove existing axes to redraw
        selection.selectAll('.axis').remove();

        // X Axis
        selection.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Y Axis
        selection.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y));

    }, []);

    return (
        <PlaygroundCard title="Bar Chart Example" height={500}>
            <BaseChart onReady={onReady} />
        </PlaygroundCard>
    );
};

export default BarChartExample;
