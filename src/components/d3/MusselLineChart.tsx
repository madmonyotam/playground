'use client';

import React, { useEffect } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';
import { getOrCreateTooltip } from './chart-effects';

export interface ScanData {
    customer_id: string;
    farm_id: string;
    line_id: string;
    scan_date: string;
    scan_processing_date: string;
    pipeline_version: string;
    latitude: number;
    longitude: number;
    length_stats: {
        min: number;
        avg: number;
        max: number;
    };
    width_stats: {
        min: number;
        avg: number;
        max: number;
    };
    count_statistics: {
        total_mussel_count_per_m: {
            average: number;
            std: number;
        },
        green_mussel_count_per_m: {
            average: number;
            std: number;
        },
        blue_mussel_count_per_m: {
            average: number;
            std: number;
        },
        blue_mussel_percentage_average: number;
    },
}

interface MusselLineChartProps {
    data: ScanData[];
    className?: string;
    selectedLineId?: string | null;
    onLineSelect?: (lineId: string) => void;
    colors?: {
        healthy?: string;
        parasite?: string;
        text?: string;
        label?: string;
        selected?: string;
    };
}

const MusselLineChart: React.FC<MusselLineChartProps> = ({
    data,
    className,
    selectedLineId,
    onLineSelect,
    colors: userColors
}) => {
    // Theme colors
    const colors = {
        healthy: userColors?.healthy || '#00cc88', // Green
        parasite: userColors?.parasite || '#3366cc', // Blue
        text: userColors?.text || '#00e5ff',     // Cyan-ish text
        label: userColors?.label || '#8899a6',     // Subdued label
        selected: userColors?.selected || '#00e5ff' // Default to text color (cyan)
    };

    const drawChart = (
        parentG: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => {
        const { width, height } = dimensions;

        // Ensure we re-render if selection changes
        parentG.on('click', () => {
            // Optional: deselect if clicking bg?
        });

        // Clear previous, but preserve existing defs if we want to be efficient? 
        // Actually existing code does parentG.selectAll('*').remove(), which clears defs too.
        // But getOrCreateTooltip appends to PARENT of svg, so it's not cleared by this.
        // We should ensure we don't duplicate tooltip or it's handled by helper.
        // Helper checks for class name, so it's fine.
        parentG.selectAll('*').remove();

        // Margins for labels
        const margin = { top: 40, right: 0, bottom: 20, left: 0 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = parentG.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Define Gradients
        const defs = parentG.append('defs');

        // Healthy Gradient (Green)
        const healthyGrad = defs.append('linearGradient')
            .attr('id', 'healthyGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        healthyGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.healthy).attr('stop-opacity', 0.9);
        healthyGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.healthy).attr('stop-opacity', 0.4);

        // Parasite Gradient (Blue)
        const parasiteGrad = defs.append('linearGradient')
            .attr('id', 'parasiteGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        parasiteGrad.append('stop').attr('offset', '0%').attr('stop-color', colors.parasite).attr('stop-opacity', 0.9);
        parasiteGrad.append('stop').attr('offset', '100%').attr('stop-color', colors.parasite).attr('stop-opacity', 0.4);

        // Scales
        const x = d3.scaleBand()
            .range([0, innerWidth])
            .domain(data.map(d => d.line_id))
            .padding(0.4);

        const y = d3.scaleLinear()
            .range([innerHeight, 0])
            .domain([0, 100]); // Percentage 0-100

        // Add Grid Lines (Behind bars)
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.2)
            .call(d3.axisLeft(y)
                .tickSize(-innerWidth)
                .ticks(5)
                .tickFormat(() => '') // No labels on grid
            )
            .selectAll('.tick line')
            .attr('stroke', '#4a5568')
            .attr('stroke-dasharray', '4 4'); // Dashed grid

        g.select('.grid path').remove(); // Remove axis line

        // Data processing for stack
        const stackData = data.map(d => {
            const bluePct = d.count_statistics.blue_mussel_percentage_average * 100;
            const healthPct = 100 - bluePct;
            return {
                ...d,
                healthy: healthPct,
                parasite: bluePct
            };
        });

        const stack = d3.stack<typeof stackData[0]>()
            .keys(['healthy', 'parasite']);

        const layers = stack(stackData);

        // Tooltip (HTML Overlay)
        const container = d3.select(parentG.node()!.ownerSVGElement!.parentNode as HTMLElement);
        const tooltip = getOrCreateTooltip(container, 'dark', colors.text, 'mussel-line-tooltip');

        // Bars
        const layerGroups = g.selectAll('.layer')
            .data(layers)
            .join('g')
            .join('g')
            .attr('fill', d => d.key === 'healthy' ? 'url(#healthyGradient)' : 'url(#parasiteGradient)');

        layerGroups.selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', d => x(d.data.line_id) || 0)
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth())
            .attr('width', x.bandwidth())
            .attr('stroke', d => d.data.line_id === selectedLineId ? colors.selected : 'none')
            .attr('stroke-width', d => d.data.line_id === selectedLineId ? 1 : 0)
            .style('filter', d => d.data.line_id === selectedLineId ? 'brightness(1.5)' : null)
            .style('cursor', 'pointer')
            .on('click', function (event, d) {
                event.stopPropagation();
                if (onLineSelect) {
                    onLineSelect(d.data.line_id);
                }
            })
            .on('mouseenter', function (event, d) {
                const node = d3.select(this);
                // Make lighter on hover using brightness filter (if not already selected)
                if (d.data.line_id !== selectedLineId) {
                    node.style('filter', 'brightness(1.3)');
                }

                tooltip.style('opacity', 1);
            })
            .on('mousemove', function (event, d) {
                const [mx, my] = d3.pointer(event, container.node());
                // Update text
                tooltip.html(`
                    <div style="font-weight: 600; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Line ${d.data.line_id}</div>
                    <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px; font-size: 11px;">
                        <span style="opacity: 0.7;">Date:</span>
                        <span style="text-align: right;">${d.data.scan_date}</span>
                        
                        <span style="opacity: 0.7;">Avg Len:</span>
                        <span style="text-align: right;">${d.data.length_stats.avg.toFixed(1)}mm</span>
                        
                        <span style="opacity: 0.7;">Count/m:</span>
                        <span style="text-align: right;">${d.data.count_statistics.total_mussel_count_per_m.average.toFixed(0)}</span>
                        
                        <span style="opacity: 0.7;">Parasite:</span>
                        <span style="text-align: right; color: ${colors.parasite}; font-weight: bold;">${(d.data.count_statistics.blue_mussel_percentage_average * 100).toFixed(1)}%</span>
                    </div>
                `)
                    .style('transform', `translate(${mx + 15}px, ${my + 15}px)`);
            })
            .on('mouseleave', function (event, d) {
                // Restore state depending on selection
                if (d.data.line_id !== selectedLineId) {
                    d3.select(this).style('filter', null);
                }
                tooltip.style('opacity', 0);
            });

        // Top Labels: Line ID
        g.selectAll('.label-line')
            .data(data)
            .join('text')
            .attr('x', d => (x(d.line_id) || 0) + x.bandwidth() / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.text)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.line_id);

        // Top Labels: Count
        g.selectAll('.label-count')
            .data(data)
            .join('text')
            .attr('x', d => (x(d.line_id) || 0) + x.bandwidth() / 2)
            .attr('y', -25)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.label)
            .style('font-size', '10px')
            .text(d => {
                const val = d.count_statistics.total_mussel_count_per_m.average;
                return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0);
            });

        // Grid background (optional)
        // ...
    };

    return (
        <BaseChart onReady={drawChart} /> // BaseChart likely needs to know about props to trigger re-render if deps change? 
        // BaseChart implementation uses useEffect with onReady. 
        // If drawChart changes (which it does because it captures selectedLineId), it re-runs.
    );
};

export default MusselLineChart;
