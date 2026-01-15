import * as d3 from 'd3';
import { HistogramBin } from './chart-types';

export const setupGradients = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    category: string,
    color: string
) => {
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
};

export const attachTooltipEvents = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    {
        primaryColor,
        theme,
        showTooltip = true,
        tooltipFormatter
    }: {
        primaryColor: string;
        theme: 'dark' | 'light';
        showTooltip?: boolean;
        tooltipFormatter?: (d: HistogramBin) => string;
    }
) => {
    const bars = g.selectAll<SVGRectElement, HistogramBin>('.bar');

    // Always clear previous events to avoid duplicates or stale handlers
    bars.on('mouseover', null)
        .on('mousemove', null)
        .on('mouseleave', null);

    if (!showTooltip) return;

    // 1. Setup Tooltip Div
    const container = d3.select(g.node()!.ownerSVGElement!.parentNode as HTMLElement);
    let tooltip = container.select<HTMLDivElement>('.distribution-tooltip');

    // Styles
    const bgColor = theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const textColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
    const borderColor = `${primaryColor}33`;
    const shadow = `0 4px 12px ${primaryColor}40`;
    const highlightStroke = d3.color(primaryColor)
        ? (theme === 'dark' ? d3.color(primaryColor)!.brighter(1.5).formatHex() : d3.color(primaryColor)!.darker(1.5).formatHex())
        : '#ffffff';

    if (tooltip.empty()) {
        tooltip = container.append('div')
            .attr('class', 'distribution-tooltip')
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('padding', '8px 12px')
            .style('border-radius', '8px')
            .style('font-family', 'Inter, system-ui, sans-serif')
            .style('font-size', '12px')
            .style('z-index', '100')
            // Add transform transition for smooth movement
            .style('transition', 'opacity 0.2s, transform 0.15s ease-out')
            .style('backdrop-filter', 'blur(10px)')
            .style('-webkit-backdrop-filter', 'blur(10px)');
    }

    // Apply/Update dynamic styles
    tooltip
        .style('background', bgColor)
        .style('color', textColor)
        .style('border', `1px solid ${borderColor}`)
        .style('box-shadow', shadow);

    // Default formatter if none provided
    const formatContent = tooltipFormatter || ((d: HistogramBin) => `
        <div style="font-weight: 500; opacity: 0.8; margin-bottom: 2px;">${d.range}</div>
        <div style="font-weight: 700; color: ${primaryColor}; font-size: 14px;">${d.percentage.toFixed(1)}%</div>
    `);

    // 2. Attach events to bars
    bars.on('mouseover', function (event, d) {
        tooltip.style('opacity', 1);
        d3.select(this)
            .transition().duration(200)
            .style('opacity', 0.9);

        // Highlight corresponding point
        g.selectAll<SVGCircleElement, HistogramBin>('.point')
            .filter(p => p.range === d.range)
            .transition().duration(200)
            .attr('r', 6)
            .attr('stroke', highlightStroke)
            .attr('stroke-width', 1.5);
    })
        .on('mousemove', function (event, d) {
            const [x, y] = d3.pointer(event, container.node());
            // Use transform for smooth transition
            tooltip
                .html(formatContent(d))
                .style('transform', `translate(${x + 15}px, ${y + 15}px)`);
        })
        .on('mouseleave', function (event, d) {
            tooltip.style('opacity', 0);
            d3.select(this)
                .transition().duration(200)
                .style('opacity', 1);

            // Un-highlight corresponding point
            g.selectAll<SVGCircleElement, HistogramBin>('.point')
                .filter(p => p.range === d.range)
                .transition().duration(200)
                .attr('r', 4)
                .attr('stroke', 'none');
        });
};
