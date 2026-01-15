import * as d3 from 'd3';
import { HistogramBin } from './chart-types';

export const prepareScales = (
    data: HistogramBin[],
    width: number,
    height: number,
    barPadding: number = 0.2
) => {
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.range))
        .range([0, width])
        .padding(barPadding);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.percentage) || 100])
        .nice()
        .range([height, 0]);

    return { xScale, yScale };
};

export const paintAxes = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
    config: {
        width: number;
        height: number;
        theme: 'dark' | 'light';
        xAxisLabel: string;
        yAxisLabel: string;
        maxXTicks?: number;
        animationSpeed: number;
        gridLines?: boolean;
    }
) => {
    const { xScale, yScale } = scales;
    const { width, height, theme: currentTheme, xAxisLabel: xLabel, yAxisLabel: yLabel, maxXTicks, animationSpeed, gridLines = true } = config;
    const textColor = currentTheme === 'dark' ? '#9ca3af' : '#4b5563';
    const gridColor = currentTheme === 'dark' ? '#374151' : '#e5e7eb';

    // X Axis
    let xAxis = g.select<SVGGElement>('.x-axis');
    if (xAxis.empty()) {
        xAxis = g.append('g').attr('class', 'x-axis');
    }

    // Calculate ticks
    let tickValues = xScale.domain();
    if (maxXTicks && tickValues.length > maxXTicks) {
        const step = Math.ceil(tickValues.length / maxXTicks);
        tickValues = tickValues.filter((_, i) => i % step === 0);
    }

    const xAxisTransition = xAxis
        .attr('transform', `translate(0,${height})`)
        .transition().duration(animationSpeed)
        .call(d3.axisBottom(xScale).tickValues(tickValues).tickSize(0).tickPadding(10));

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

    // Ensure axis doesn't block events
    xAxis.style('pointer-events', 'none');

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
        .call(d3.axisLeft(yScale).ticks(5).tickSize(gridLines ? -width : 0).tickPadding(10));

    yAxisTransition.select('.domain')
        .style('stroke', 'none')
        .style('display', 'none')
        .remove();

    yAxisTransition.selectAll('.tick line')
        .attr('stroke-opacity', gridLines ? 0.5 : 0) // Hide lines if gridLines is false
        .attr('stroke-dasharray', '4,4')
        .attr('stroke', gridColor);

    // Force hide immediately on the selection too
    yAxis.selectAll('.domain')
        .style('stroke', 'none')
        .style('display', 'none');

    // Ensure axis doesn't block events
    yAxis.style('pointer-events', 'none');

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

};

export const paintBars = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: HistogramBin[],
    scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
    config: {
        category: string;
        color: string;
        animationSpeed: number;
    }
) => {
    const { xScale, yScale } = scales;
    const { category, color, animationSpeed } = config;
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
};

export const paintLine = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: HistogramBin[],
    scales: { xScale: d3.ScaleBand<string>; yScale: d3.ScaleLinear<number, number> },
    prevDataRef: React.MutableRefObject<HistogramBin[]>,
    config: {
        category: string;
        color: string;
        animationSpeed: number;
        curveType?: 'monotoneX' | 'natural' | 'linear';
    }
) => {
    const { xScale, yScale } = scales;
    const { category, color, animationSpeed, curveType = 'monotoneX' } = config;

    // Choose curve factory
    let curveFactory = d3.curveMonotoneX;
    if (curveType === 'natural') curveFactory = d3.curveNatural;
    if (curveType === 'linear') curveFactory = d3.curveLinear;

    const prevData = prevDataRef.current;
    const isFirstRender = prevData.length === 0;

    const lineGenerator = d3.line<HistogramBin>()
        .x(d => (xScale(d.range)! + xScale.bandwidth() / 2))
        .y(d => yScale(d.percentage))
        .curve(curveFactory);

    // Define a path for the line
    let path = g.select<SVGPathElement>('.trend-line');
    if (path.empty()) {
        path = g.append('path').attr('class', 'trend-line');
        // Initialize with zero opacity
        path.style('opacity', 0);
    }

    const t = g.transition().duration(animationSpeed);

    const newPathD = lineGenerator(data);

    path
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .style('filter', `url(#glow-${category})`)
        .style('pointer-events', 'none');

    if (isFirstRender) {
        // First render: Fade in and set d
        path.attr('d', newPathD!)
            .transition(t as any)
            .style('opacity', 1);
    } else {
        // Morphing using sampling
        path.style('opacity', 1) // Ensure it's visible
            .transition(t as any)
            .attrTween('d', function (d) {
                const previous = d3.select(this).attr('d');
                const current = newPathD!;

                // Safe check if previous is missing
                if (!previous) return () => current;

                // Create hidden paths to sample length
                // We need to use the DOM to compute path length, or use a library.
                // Since we are in a browser environment, creating elements is fine.
                const pathSrc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathSrc.setAttribute('d', previous);
                const pathTgt = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathTgt.setAttribute('d', current);

                const lenSrc = pathSrc.getTotalLength();
                const lenTgt = pathTgt.getTotalLength();

                // Number of samples for smooth interpolation
                const n = 100;
                const pointsSrc: { x: number, y: number }[] = [];
                const pointsTgt: { x: number, y: number }[] = [];

                for (let i = 0; i <= n; i++) {
                    const p1 = pathSrc.getPointAtLength(lenSrc * i / n);
                    const p2 = pathTgt.getPointAtLength(lenTgt * i / n);
                    pointsSrc.push({ x: p1.x, y: p1.y });
                    pointsTgt.push({ x: p2.x, y: p2.y });
                }

                // Interpolator function
                return function (t: number) {
                    const interpolatedPoints = pointsSrc.map((p1, i) => {
                        const p2 = pointsTgt[i];
                        return {
                            x: p1.x * (1 - t) + p2.x * t,
                            y: p1.y * (1 - t) + p2.y * t
                        };
                    });

                    // Reconstruct path
                    return d3.line<{ x: number, y: number }>()
                        .x(p => p.x)
                        .y(p => p.y)
                        .curve(curveFactory) // Use same curve type for tween
                        (interpolatedPoints)!;
                };
            });
    }

    // Add points (circles)
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
        .style('pointer-events', 'none')
        .attr('r', 0)
        .attr('cx', d => (xScale(d.range)! + xScale.bandwidth() / 2))
        .attr('cy', yScale(0))
        .attr('fill', color);

    pointsEnter.merge(points)
        .transition().duration(animationSpeed)
        .attr('cx', d => (xScale(d.range)! + xScale.bandwidth() / 2))
        .attr('cy', d => yScale(d.percentage))
        .attr('r', 4)
        .attr('fill', color)
        .style('opacity', 1);

    // Update ref - Caller handles ref update or we do it here? 
    // It's safer if we reference the ref and update it here as intended by previous logic
    prevDataRef.current = data;
};
