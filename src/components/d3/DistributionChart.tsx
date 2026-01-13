'use client';

import React, { memo, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';

interface HistogramBin {
    range: string;
    percentage: number;
}

interface DistributionChartProps {
    dataSource: Record<string, Record<string, HistogramBin[]>>;
    category: string;
    binSizeKey?: string; // e.g., '10mm', '5mm' - technically part of the data access path
    primaryColor?: string;
    theme?: 'dark' | 'light';
    animationSpeed?: number;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const DistributionChart = memo(({
    dataSource,
    category,
    binSizeKey = 'bin_size_10mm',
    primaryColor = '#3b82f6',
    theme = 'dark',
    animationSpeed = 800,
    xAxisLabel = 'LENGTH (MM)',
    yAxisLabel = 'PERCENTAGE (%)'
}: DistributionChartProps) => {

    const data = useMemo(() => {
        try {
            return dataSource[category][binSizeKey] || [];
        } catch (e) {
            console.warn('Data path not found', e);
            return [];
        }
    }, [dataSource, category, binSizeKey]);

    const setupGradients = useCallback((g: d3.Selection<SVGGElement, unknown, null, undefined>, color: string) => {
        const defs = g.select<SVGDefsElement>('defs');
        const defsSelection = defs.empty() ? g.append('defs') : defs;

        // Bar Gradient (Vertical)
        const barGradientId = `barGradient-${category}`;
        const barGradient = defsSelection.selectAll(`#${barGradientId}`).data([null]);

        const barGradientEnter = barGradient.enter()
            .append('linearGradient')
            .attr('id', barGradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        barGradientEnter.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.6);
        barGradientEnter.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.1);

        // Update gradient color if it changes
        defsSelection.select(`#${barGradientId}`).selectAll('stop').remove();
        const bgUpdate = defsSelection.select(`#${barGradientId}`);
        bgUpdate.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.6);
        bgUpdate.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.1);


        // Glow Filter
        const filterId = `glow-${category}`;
        const filter = defsSelection.selectAll(`#${filterId}`).data([null]);
        const filterEnter = filter.enter()
            .append('filter')
            .attr('id', filterId)
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        filterEnter.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'coloredBlur');

        const merge = filterEnter.append('feMerge');
        merge.append('feMergeNode').attr('in', 'coloredBlur');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');

    }, [category]);

    const prepareScales = useCallback((data: HistogramBin[], width: number, height: number) => {
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.range))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.percentage) || 100])
            .nice()
            .range([height, 0]);

        return { xScale, yScale };
    }, []);

    const paintAxes = useCallback((
        g: d3.Selection<SVGGElement, unknown, null, undefined>,
        scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
        config: { width: number; height: number; theme: 'dark' | 'light'; xAxisLabel: string; yAxisLabel: string }
    ) => {
        const { xScale, yScale } = scales;
        const { width, height, theme: currentTheme, xAxisLabel: xLabel, yAxisLabel: yLabel } = config;
        const textColor = currentTheme === 'dark' ? '#9ca3af' : '#4b5563';
        const gridColor = currentTheme === 'dark' ? '#374151' : '#e5e7eb';

        // X Axis
        let xAxis = g.select<SVGGElement>('.x-axis');
        if (xAxis.empty()) {
            xAxis = g.append('g').attr('class', 'x-axis');
        }

        const xAxisTransition = xAxis
            .attr('transform', `translate(0,${height})`)
            .transition().duration(animationSpeed)
            .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10));

        // Aggressively hide domain on the transition
        xAxisTransition.selectAll('.domain')
            .style('stroke', 'none')
            .style('display', 'none')
            .attr('stroke', 'none');

        xAxis.selectAll('text')
            .style('fill', textColor)
            .style('font-size', '12px')
            .style('font-family', 'sans-serif');

        // Force hide immediately on the selection too
        xAxis.selectAll('.domain')
            .style('stroke', 'none')
            .style('display', 'none')
            .attr('stroke', 'none');

        // X Axis Label
        let xLabelText = g.select<SVGTextElement>('.x-axis-label');
        if (xLabelText.empty()) {
            xLabelText = g.append('text').attr('class', 'x-axis-label');
        }
        xLabelText
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .style('fill', textColor)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('letter-spacing', '0.05em')
            .text(xLabel);


        // Y Axis
        let yAxis = g.select<SVGGElement>('.y-axis');
        if (yAxis.empty()) {
            yAxis = g.append('g').attr('class', 'y-axis');
        }

        const yAxisTransition = yAxis
            .transition().duration(animationSpeed)
            .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickPadding(10));

        yAxisTransition.select('.domain')
            .style('stroke', 'none')
            .style('display', 'none')
            .remove();

        yAxisTransition.selectAll('.tick line')
            .attr('stroke-opacity', 0.5)
            .attr('stroke-dasharray', '4,4')
            .attr('stroke', gridColor);

        // Force hide immediately on the selection too
        yAxis.selectAll('.domain')
            .style('stroke', 'none')
            .style('display', 'none');

        yAxis.selectAll('text')
            .style('fill', textColor)
            .style('font-size', '12px');

        // Y Axis Label
        let yLabelText = g.select<SVGTextElement>('.y-axis-label');
        if (yLabelText.empty()) {
            yLabelText = g.append('text').attr('class', 'y-axis-label');
        }
        yLabelText
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .style('fill', textColor)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('letter-spacing', '0.05em')
            .text(yLabel);

    }, [animationSpeed]);

    const paintBars = useCallback((
        g: d3.Selection<SVGGElement, unknown, null, undefined>,
        data: HistogramBin[],
        scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
        color: string
    ) => {
        const { xScale, yScale } = scales;
        const barGradientId = `barGradient-${category}`;

        // Select all bars
        const bars = g.selectAll<SVGRectElement, HistogramBin>('.bar')
            .data(data, d => d.range);

        // Exit
        bars.exit()
            .transition().duration(animationSpeed)
            .attr('y', yScale(0))
            .attr('height', 0)
            .style('opacity', 0)
            .attr('stroke-opacity', 0) // Fade stroke out
            .remove();

        // Enter
        const barsEnter = bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.range)!)
            .attr('y', yScale(0))
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('rx', 4) // Rounded top corners attempt
            .style('fill', `url(#${barGradientId})`)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .style('opacity', 0)
            .attr('stroke-opacity', 0); // Start with no stroke

        // Update (merge enter and update)
        barsEnter.merge(bars)
            .transition().duration(animationSpeed)
            .attr('x', d => xScale(d.range)!)
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d.percentage))
            .attr('height', d => yScale(0) - yScale(d.percentage))
            .style('fill', `url(#${barGradientId})`)
            .attr('stroke', color)
            .style('opacity', 1)
            .attr('stroke-opacity', 1); // Fade stroke in

    }, [category, animationSpeed]);

    const prevDataRef = React.useRef<HistogramBin[]>([]);

    const paintLine = useCallback((
        g: d3.Selection<SVGGElement, unknown, null, undefined>,
        data: HistogramBin[],
        scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
        color: string
    ) => {
        const { xScale, yScale } = scales;
        const prevData = prevDataRef.current;
        const shouldMorph = prevData.length === data.length && prevData.length > 0;

        const lineGenerator = d3.line<HistogramBin>()
            .x(d => (xScale(d.range)! + xScale.bandwidth() / 2))
            .y(d => yScale(d.percentage))
            .curve(d3.curveMonotoneX);

        // Define a path for the line
        let path = g.select<SVGPathElement>('.trend-line');
        if (path.empty()) {
            path = g.append('path').attr('class', 'trend-line');
            // Initialize with zero opacity or starting position if needed
            path.style('opacity', 0);
        }

        const t = g.transition().duration(animationSpeed);

        path
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round')
            .style('filter', `url(#glow-${category})`);

        if (shouldMorph) {
            // Safe to morph shape directly
            path.transition(t as any)
                .style('opacity', 1)
                .attr('d', lineGenerator);
        } else {
            // Fade out, update shape, fade in (to avoid knots)
            path.transition()
                .duration(animationSpeed / 2)
                .style('opacity', 0)
                .on('end', function () {
                    const dString = lineGenerator(data);
                    d3.select(this)
                        .attr('d', dString)
                        .transition()
                        .duration(animationSpeed / 2)
                        .style('opacity', 1);
                });
        }

        // Add points
        const points = g.selectAll<SVGCircleElement, HistogramBin>('.point')
            .data(data, d => d.range);

        points.exit()
            .transition().duration(animationSpeed)
            .attr('cy', yScale(0))
            .style('opacity', 0)
            .remove();

        const pointsEnter = points.enter()
            .append('circle')
            .attr('class', 'point')
            .attr('r', 0)
            .attr('cx', d => (xScale(d.range)! + xScale.bandwidth() / 2))
            .attr('cy', yScale(0))
            .attr('fill', color);

        pointsEnter.merge(points)
            .transition().duration(animationSpeed)
            .attr('cx', d => (xScale(d.range)! + xScale.bandwidth() / 2))
            .attr('cy', d => yScale(d.percentage))
            .attr('r', 4)
            .attr('fill', color);

        // Update ref
        prevDataRef.current = data;

    }, [category, animationSpeed]);


    const onReady = useCallback((
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => {
        if (!data || data.length === 0) return;

        setupGradients(selection, primaryColor);
        const scales = prepareScales(data, dimensions.width, dimensions.height);

        paintAxes(selection, scales, {
            width: dimensions.width,
            height: dimensions.height,
            theme,
            xAxisLabel,
            yAxisLabel
        });

        paintBars(selection, data, scales, primaryColor);
        paintLine(selection, data, scales, primaryColor);

    }, [data, primaryColor, theme, xAxisLabel, yAxisLabel, setupGradients, prepareScales, paintAxes, paintBars, paintLine]);

    return (
        <BaseChart
            onReady={onReady}
            margin={{ top: 40, right: 30, bottom: 60, left: 60 }}
        />
    );
});

DistributionChart.displayName = 'DistributionChart';

export default DistributionChart;
