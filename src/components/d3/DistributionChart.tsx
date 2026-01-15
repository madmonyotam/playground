'use client';

import React, { memo, useCallback, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import BaseChart from './BaseChart';
import { DistributionChartProps, HistogramBin } from './chart-types';
import { setupGradients, attachTooltipEvents } from './chart-effects';
import { prepareScales, paintAxes, paintBars, paintLine } from './chart-painters';

const DistributionChart = memo(({
    dataSource,
    category,
    binSizeKey = 'bin_size_10mm',
    primaryColor = '#3b82f6',
    theme = 'dark',
    animationSpeed = 800,
    xAxisLabel = 'LENGTH (MM)',
    yAxisLabel = 'PERCENTAGE (%)',
    maxXTicks,
    margin = { top: 40, right: 30, bottom: 60, left: 60 },
    gridLines = true,
    barPadding = 0.2,
    curveType = 'monotoneX',
    showTooltip = true,
    tooltipFormatter
}: DistributionChartProps) => {

    const data = useMemo(() => {
        try {
            return dataSource[category][binSizeKey] || [];
        } catch (e) {
            console.warn('Data path not found', e);
            return [];
        }
    }, [dataSource, category, binSizeKey]);

    const prevDataRef = useRef<HistogramBin[]>([]);

    const onReady = useCallback((
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => {
        // Ensure we don't crash on empty data, but allow painting empty state if needed
        // Assuming we want to clear or similar. But original code returned on empty.
        if (!data) return;

        // Block interactions during transition
        selection.style('pointer-events', 'none');

        setupGradients(selection, category, primaryColor);

        const scales = prepareScales(data, dimensions.width, dimensions.height, barPadding);

        paintAxes(selection, scales, {
            width: dimensions.width,
            height: dimensions.height,
            theme,
            xAxisLabel,
            yAxisLabel,
            maxXTicks,
            animationSpeed,
            gridLines
        });

        paintBars(selection, data, scales, {
            category,
            color: primaryColor,
            animationSpeed
        });

        paintLine(selection, data, scales, prevDataRef, {
            category,
            color: primaryColor,
            animationSpeed,
            curveType
        });

        // Attach interactive events
        attachTooltipEvents(selection, {
            primaryColor,
            theme,
            showTooltip,
            tooltipFormatter
        });

        // Re-enable interactions after transition
        selection.transition()
            .duration(animationSpeed)
            .on('end', () => {
                selection.style('pointer-events', 'all');
            });

    }, [
        data,
        primaryColor,
        theme,
        xAxisLabel,
        yAxisLabel,
        animationSpeed,
        maxXTicks,
        category,
        barPadding,
        gridLines,
        curveType,
        showTooltip,
        tooltipFormatter
    ]);

    return (
        <BaseChart
            onReady={onReady}
            margin={margin}
        />
    );
});

DistributionChart.displayName = 'DistributionChart';

export default DistributionChart;
