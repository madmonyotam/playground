'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import BaseChart from './BaseChart';

// --- Types ---
export interface CompassProps {
    size?: number;
    heading: number;
    theme?: 'light' | 'dark';
    showTicks?: boolean;
    tickStep?: number;
    tickLength?: number;
    animate?: boolean;
    duration?: number;
    primaryColor?: string;
    shadowColor?: string;
    onHeadingChange?: (heading: number) => void;
}

// --- Styled Components ---

const CompassWrapper = styled.div<{ $size: number }>`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Inter', sans-serif; 
`;

// --- Drawing Helper Functions ---

// 1. Define Gradients & Filters
const defineGradientsAndFilters = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    primaryColor: string,
    shadowColor: string
) => {
    const defs = container.append('defs');

    // Outer Glow/Gradient
    const outerGrad = defs.append('radialGradient')
        .attr('id', 'outer-grad')
        .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');

    outerGrad.append('stop').attr('offset', '80%').attr('stop-color', '#fff').attr('stop-opacity', 0);
    outerGrad.append('stop').attr('offset', '100%').attr('stop-color', primaryColor).attr('stop-opacity', 0.15);

    // Center Hub Gradient
    const hubGrad = defs.append('linearGradient')
        .attr('id', 'hub-grad')
        .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');

    hubGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', 0.9);
    hubGrad.append('stop').attr('offset', '100%').attr('stop-color', '#e0eaec').attr('stop-opacity', 0.7);

    // Simple Shadow
    const shadow = defs.append('filter').attr('id', 'simple-shadow');
    shadow.append('feDropShadow')
        .attr('dx', 0).attr('dy', 2)
        .attr('stdDeviation', 4)
        .attr('flood-color', shadowColor).attr('flood-opacity', 0.3);
};

// 2. Draw Base Plate (Static Background)
const drawBasePlate = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    centerHubRadius: number,
    primaryColor: string
) => {
    const baseGroup = container.append('g')
        .attr('class', 'base-plate')
        .attr('transform', `translate(${centerX}, ${centerY})`);

    // Outer rim
    baseGroup.append('circle')
        .attr('r', radius)
        .attr('fill', 'url(#outer-grad)')
        .attr('stroke', primaryColor)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3);

    // Crosshairs helper
    const drawCrosshair = (x1: number, y1: number, x2: number, y2: number) => {
        baseGroup.append('line')
            .attr('x1', x1).attr('y1', y1)
            .attr('x2', x2).attr('y2', y2)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5);
    };

    drawCrosshair(-radius * 0.8, 0, -centerHubRadius * 1.2, 0);
    drawCrosshair(centerHubRadius * 1.2, 0, radius * 0.8, 0);
    drawCrosshair(0, -radius * 0.8, 0, -centerHubRadius * 1.2);
    drawCrosshair(0, centerHubRadius * 1.2, 0, radius * 0.8);

    return baseGroup;
};

// 3. Draw Ticks
const drawTicks = (
    parentGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    radius: number,
    tickStep: number,
    tickLength: number,
    primaryColor: string
) => {
    const ticksGroup = parentGroup.append('g').attr('class', 'ticks');
    const totalTicks = 360 / tickStep;

    ticksGroup.selectAll('line')
        .data(d3.range(totalTicks))
        .enter()
        .append('line')
        .attr('transform', d => `rotate(${d * tickStep})`)
        .attr('y1', -radius + tickLength)
        .attr('y2', -radius)
        .attr('stroke', primaryColor)
        .attr('stroke-width', d => (d * tickStep) % 90 === 0 ? 3 : 1) // Slightly thicker base
        .attr('stroke-opacity', d => (d * tickStep) % 90 === 0 ? 0.8 : 0.4);
};

// 4. Draw Cardinal Points (N, E, S, W)
const drawCardinalPoints = (
    parentGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    radius: number,
    primaryColor: string,
    nButtonRadius: number,
    nFontSize: number,
    cardinalFontSize: number
) => {
    const cardinalsGroup = parentGroup.append('g').attr('class', 'cardinals');

    const padding = -radius * 0.75;

    // North Circle
    const northGroup = cardinalsGroup.append('g')
        .attr('transform', `translate(0, ${padding})`);

    northGroup.append('circle')
        .attr('r', nButtonRadius)
        .attr('fill', primaryColor)
        .attr('filter', 'url(#simple-shadow)');

    northGroup.append('text')
        .text('N')
        .attr('fill', '#fff')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', `${nFontSize}px`)
        .attr('font-weight', 'bold');

    // Other Directions (Letters E, S, W)
    const otherDirs = [
        { deg: 90, label: 'E' },
        { deg: 180, label: 'S' },
        { deg: 270, label: 'W' }
    ];

    otherDirs.forEach(item => {
        const g = cardinalsGroup.append('g')
            .attr('transform', `rotate(${item.deg}) translate(0, ${padding})`);

        g.append('text')
            .text(item.label)
            .attr('fill', primaryColor)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', `${cardinalFontSize}px`)
            .attr('font-weight', 'bold')
            // Counter-rotate the text so it's upright relative to the screen
            .attr('transform', `rotate(${-item.deg})`);
    });
};

// 5. Draw Center Hub (Just the rotating part: circle + arrow)
const drawCenterHub = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    primaryColor: string,
    arrowSize: number
) => {
    const hubGroup = container.append('g')
        .attr('class', 'center-hub')
        .attr('transform', `translate(${centerX}, ${centerY})`);

    // Hub Circle
    hubGroup.append('circle')
        .attr('r', radius)
        .attr('fill', 'url(#hub-grad)')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0)
        .attr('filter', 'url(#simple-shadow)');

    // Arrow (Triangle pointing up)
    // Position arrow slightly below top edge
    const arrowY = radius * 0.6; // Push it out a bit

    hubGroup.append('path')
        .attr('d', `M 0 ${-arrowSize * 1.5} L ${-arrowSize} ${arrowSize / 2} L ${arrowSize} ${arrowSize / 2} Z`)
        .attr('transform', `translate(0, ${-arrowY})`) // Move it up (North on the hub)
        .attr('fill', primaryColor);

    return hubGroup;
};

// 6. Draw Static Heading Text (Does not rotate)
const drawHeadingText = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    primaryColor: string,
    fontSize: number
) => {
    const textGroup = container.append('g')
        .attr('class', 'heading-group')
        .attr('transform', `translate(${centerX}, ${centerY})`);

    // Text Label - Centered
    textGroup.append('text')
        .attr('class', 'heading-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em') // Vertically centered
        .attr('fill', primaryColor)
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', '600')
        .style('pointer-events', 'none') // Let clicks pass through to drag handler
        .text('0°');

    return textGroup;
};

// 7. Interaction Helper
const setupInteraction = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    onHeadingChange: (deg: number) => void
) => {
    const interactionOverlay = container.append('circle')
        .attr('r', radius * 1.1)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('fill', 'transparent')
        .style('cursor', 'grab');

    interactionOverlay.call(d3.drag<SVGCircleElement, unknown>()
        .on('start', () => interactionOverlay.style('cursor', 'grabbing'))
        .on('drag', (event) => {
            const [mx, my] = d3.pointer(event, container.node());
            const vecX = mx - centerX;
            const vecY = my - centerY;

            // Convert atan2 angle to compass (0 is Up/N)
            let deg = (Math.atan2(vecY, vecX) * 180 / Math.PI) + 90;
            if (deg < 0) deg += 360;

            onHeadingChange(deg);
        })
        .on('end', () => interactionOverlay.style('cursor', 'grab'))
    );

    interactionOverlay.on('dblclick', () => onHeadingChange(0));
};


// --- Main Component ---

const Compass: React.FC<CompassProps> = ({
    heading,
    theme = 'light',
    showTicks = true,
    tickStep = 10,
    tickLength = 10,
    animate = true,
    duration = 800,
    primaryColor = '#007AFF',
    shadowColor = '#000000',
    onHeadingChange,
}) => {
    const currentRotationRef = useRef(0);
    const rootGroup = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
    const chartDims = useRef<{ width: number, height: number } | null>(null);

    // Helper: Shortest path interpolation logic
    const getTargetRotation = (targetHeading: number) => {
        const current = currentRotationRef.current;
        const diff = ((targetHeading - current) % 360 + 540) % 360 - 180;
        const nextRotation = current + diff;
        currentRotationRef.current = nextRotation;
        return nextRotation;
    };

    // Main Draw Function
    const drawChart = React.useCallback((container: d3.Selection<SVGGElement, unknown, null, undefined>, dimensions: { width: number, height: number }) => {
        const { width, height } = dimensions;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 * 0.9;
        const centerHubRadius = radius * 0.4;

        // --- Responsive Scales ---
        // Domain is based on typical radius size (e.g., 50px to 300px)
        const rDomain = [50, 300];

        // 1. Heading Text
        const headingFontScale = d3.scaleLinear().domain(rDomain).range([12, 48]).clamp(true);
        const headingFontSize = headingFontScale(radius);

        // 2. Cardinal Points (N, E, S, W)
        const cardinalFontScale = d3.scaleLinear().domain(rDomain).range([10, 24]).clamp(true);
        const cardinalFontSize = cardinalFontScale(radius);

        // 3. N Button Radius
        const nButtonScale = d3.scaleLinear().domain(rDomain).range([12, 40]).clamp(true);
        const nButtonRadius = nButtonScale(radius);

        // 4. Tick Length (Base is prop, scaled slightly)
        const tickScale = d3.scaleLinear().domain(rDomain).range([tickLength * 0.8, tickLength * 1.5]).clamp(true);
        const scaledTickLength = tickScale(radius);

        // 5. Arrow Size
        const arrowScale = d3.scaleLinear().domain(rDomain).range([5, 12]).clamp(true);
        const arrowSize = arrowScale(radius);


        // Clear previous
        container.selectAll('*').remove();

        // 1. Defs
        defineGradientsAndFilters(container, primaryColor, shadowColor || '#000000');

        // 2. Base Plate
        const baseGroup = drawBasePlate(container, centerX, centerY, radius, centerHubRadius, primaryColor);

        // 3. Ticks
        if (showTicks) {
            drawTicks(baseGroup, radius, tickStep || 10, scaledTickLength, primaryColor);
        }

        // 4. Cardinals
        drawCardinalPoints(baseGroup, radius, primaryColor, nButtonRadius, nButtonRadius * 0.6, cardinalFontSize);
        // Using nButtonRadius * 0.6 as approx font size for 'N' inside the button.

        // 5. Center Hub (Just the rotating background & arrow)
        drawCenterHub(container, centerX, centerY, centerHubRadius, primaryColor, arrowSize);

        // 6. Heading Text (Static, on top)
        drawHeadingText(container, centerX, centerY, primaryColor, headingFontSize);

        // 7. Interaction
        if (onHeadingChange) {
            setupInteraction(container, centerX, centerY, radius, onHeadingChange);
        }
    }, [primaryColor, shadowColor, showTicks, tickStep, tickLength, onHeadingChange]);

    const handleReady = React.useCallback((selection: d3.Selection<SVGGElement, unknown, null, undefined>, dimensions: { width: number, height: number }) => {
        rootGroup.current = selection;
        chartDims.current = dimensions;
        drawChart(selection, dimensions);

        // Initialize rotation
        updateRotation(selection, dimensions, heading, false);
    }, [drawChart, heading]);

    const updateRotation = (
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dims: { width: number, height: number },
        angle: number,
        shouldAnimate: boolean
    ) => {
        const { width, height } = dims;
        const centerX = width / 2;
        const centerY = height / 2;
        const targetRot = getTargetRotation(angle);

        const hub = selection.select<SVGGElement>('.center-hub');
        const text = selection.select<SVGTextElement>('.heading-text');

        if (hub.empty()) return;

        if (shouldAnimate) {
            const t = d3.transition()
                .duration(duration || 800)
                .ease(d3.easeCubicOut) as unknown as d3.Transition<any, any, any, any>;

            // Rotate ONLY the hub (arrow + circle)
            hub.transition(t)
                .attr('transform', `translate(${centerX}, ${centerY}) rotate(${targetRot})`);

            // Update text CONTENT only (it is static in position)
            text.transition(t)
                .tween('text', function () {
                    const that = this;
                    const startAngle = parseFloat(that.textContent || '0');
                    const iNum = d3.interpolate(startAngle, angle);

                    return function (t) {
                        that.textContent = `${Math.round(Math.abs(iNum(t)) % 360)}°`;
                    };
                });
        } else {
            // Interrupt any active transition
            hub.interrupt();
            text.interrupt();

            hub.attr('transform', `translate(${centerX}, ${centerY}) rotate(${targetRot})`);
            text.text(`${Math.round(angle)}°`);
        }
    };


    // Effect for heading changes
    useEffect(() => {
        if (rootGroup.current && chartDims.current) {
            updateRotation(rootGroup.current, chartDims.current, heading, animate || false);
        }
    }, [heading, animate, duration]);

    // Effect for structural redraws
    useEffect(() => {
        if (rootGroup.current && chartDims.current) {
            drawChart(rootGroup.current, chartDims.current);
            updateRotation(rootGroup.current, chartDims.current, heading, false);
        }
    }, [drawChart]);


    return (
        <CompassWrapper $size={400}>
            <BaseChart onReady={handleReady} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} />
        </CompassWrapper>
    );
};

export default Compass;
