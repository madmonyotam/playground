import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import BaseChart from '../BaseChart';

// --- Styled Components ---

const Container = styled.div<{ $bg: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ $bg }) => $bg};
  overflow: hidden;
  color: #fff;
  font-family: 'Inter', sans-serif;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated; /* Good for clear heatmap edges */
`;

const SvgOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass to canvas if needed, or handle hover on SVG */
`;

// --- Types ---

export interface SpectrogramData {
    metadata: {
        sampleRate: number;
        fftSize: number;
        startTime: string;
        freqMin: number;
        freqMax: number;
        unit: string;
    };
    axes: {
        frequencies: number[];
        timestamps: number[];
    };
    data: number[][];
}

export interface SpectrogramComponentProps {
    data: SpectrogramData | null;
    theme?: {
        minColor: string;
        maxColor: string;
        backgroundColor?: string;
        axesColor?: string;
    };
    valueRange?: [number, number]; // [min, max] range for color mapping
    showAxes?: boolean;
    interpolate?: boolean;
}

// --- Utils ---

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 };

// --- Component ---

const SpectrogramCore = ({
    data,
    theme = { minColor: '#000000', maxColor: '#ff0000', backgroundColor: '#000000', axesColor: '#00ffff' },
    valueRange = [-100, -30],
    showAxes = true,
    interpolate = false
}: SpectrogramComponentProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const svgOverlayRef = useRef<SVGSVGElement>(null);

    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

    const handleReady = useCallback((
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dims: { width: number; height: number }
    ) => {
        setDimensions(dims);
    }, []);

    // Create D3 color scale based on valueRange and theme
    const colorScale = useMemo(() => {
        // Creating a custom color scale similar to a classic "turbo" or "viridis" if wanted,
        // but let's use the requested minColor to maxColor standard gradient.
        // Or better, a robust multi-stop scale. For now, we will use a 3-stop or d3 sequential if requested.
        // Assuming minColor is noise floor (dark), maxColor is hot signal (bright)

        // A nice heatmap scale: black -> dark blue -> turquoise -> yellow -> red
        const defaultInterpolator = d3.scaleSequential(d3.interpolateTurbo)
            .domain([valueRange[0], valueRange[1]]);

        // If custom colors are strongly provided and not matching standard, we can use a linear scale
        const customScale = d3.scaleLinear<string>()
            .domain([valueRange[0], (valueRange[0] + valueRange[1]) / 2, valueRange[1]])
            .range([theme.minColor, '#00ffff', theme.maxColor])
            .clamp(true);

        return customScale;
    }, [valueRange, theme]);


    // Draw Heatmap to Canvas
    useEffect(() => {
        if (!dimensions || !data || data.data.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;

        // Ensure canvas element dimensions match display dimensions exactly for 1:1 pixel mapping
        // Taking device pixel ratio into account
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.imageSmoothingEnabled = interpolate;

        const numTimeSlices = data.data.length; // rows
        const numFreqBins = data.data[0].length; // cols

        const cellWidth = width / numTimeSlices;
        const cellHeight = height / numFreqBins;

        ctx.clearRect(0, 0, width, height);

        // Render each cell
        // We draw time on the X axis, frequency on the Y axis
        // Typically higher frequencies are at the top, lower at bottom.
        for (let t = 0; t < numTimeSlices; t++) {
            for (let f = 0; f < numFreqBins; f++) {
                const value = data.data[t][f];
                const color = colorScale(value);

                ctx.fillStyle = color;

                // x = time
                const x = t * cellWidth;
                // y = frequency. Invert Y so 0 (min freq) is at the bottom.
                const y = height - ((f + 1) * cellHeight);

                // Draw cell slightly larger to prevent subpixel gaps (bleeding) if not interpolated
                // When we have lots of data, we might draw pixel arrays (ImageData) directly for massive performance boost,
                // but fillRect is okay for moderate sizes. If it's a huge matrix, we switch to ImageData.
                ctx.fillRect(x - 0.5, y - 0.5, cellWidth + 1, cellHeight + 1);
            }
        }
    }, [data, dimensions, colorScale, interpolate]);


    // Draw Axes to SVG Overlay
    useEffect(() => {
        if (!dimensions || !data || !showAxes) return;
        const svg = d3.select(svgOverlayRef.current);
        svg.selectAll('*').remove();

        const { width, height } = dimensions;

        // Time scale (x-axis)
        // Assume timestamps array maps linearly to width
        // Handle case where timestamps might be empty
        const timeExtent = data.axes.timestamps.length > 0 ?
            [data.axes.timestamps[0], data.axes.timestamps[data.axes.timestamps.length - 1]] : [0, 100];

        const xScale = d3.scaleLinear()
            .domain(timeExtent)
            .range([0, width]);

        // Frequency scale (y-axis)
        const freqExtent = data.axes.frequencies.length > 0 ?
            [data.axes.frequencies[0], data.axes.frequencies[data.axes.frequencies.length - 1]] : [data.metadata.freqMin, data.metadata.freqMax];

        const yScale = d3.scaleLinear()
            .domain(freqExtent)
            .range([height, 0]); // Inverted for canvas

        // Axes formatting
        const xAxis = d3.axisTop(xScale).ticks(5).tickFormat(d => d + 'ms');
        const yAxis = d3.axisRight(yScale).ticks(10).tickFormat(d => d + ' MHz');
        const computedAxesColor = theme.axesColor || '#00ffff';

        const axesG = svg.append('g').style('color', computedAxesColor);

        axesG.append('g')
            .attr('transform', 'translate(0, 20)')
            .call(xAxis as any)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', computedAxesColor).attr('stroke-opacity', 0.2).attr('y2', height));

        axesG.append('g')
            .attr('transform', `translate(${width - 60}, 0)`)
            .call(yAxis as any)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', computedAxesColor).attr('stroke-opacity', 0.2).attr('x2', -width));

        axesG.selectAll('text').style('font-family', 'monospace').style('font-size', '10px');

    }, [data, dimensions, showAxes, theme.axesColor]);


    return (
        <Container $bg={theme.backgroundColor || '#000000'}>
            <BaseChart
                onReady={handleReady}
                margin={zeroMargin}
            >
                {/* BaseChart gives us the dimensions, but we will use refs to draw absolutely over it */}
            </BaseChart>
            <Canvas ref={canvasRef} />
            <SvgOverlay ref={svgOverlayRef} />
        </Container>
    );
};

export default SpectrogramCore;
