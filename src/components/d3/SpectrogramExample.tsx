'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import SpectrogramCore, { SpectrogramData } from './Spectrogram/SpectrogramCore';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import {
    ControlsContainer,
    ControlSection,
    RangeControl,
    ToggleControl,
    ColorControl,
    Label,
    ButtonGroup,
    ControlButton
} from './controls/ControlWidgets';

const ExampleContainer = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  position: relative;
  background-color: #000000;
  border-radius: 8px;
  overflow: hidden;
  transition: height 0.3s ease;
`;

// Helper to generate mock data
function generateMockSpectrogram(rows: number, cols: number, noiseLevel: number, signalStrength: number, signalProbability: number) {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => {
            // רעש בסיסי נמוך (Floor noise)
            let signal = Math.random() * -10 - 90 + noiseLevel;

            // הוספת "סיגנל" אקראי חזק יותר באזורים מסוימים
            if (Math.random() > 1 - signalProbability) signal += signalStrength;

            return parseFloat(signal.toFixed(2));
        })
    );
}

const SpectrogramExample = () => {
    // Basic Settings
    const [containerHeight, setContainerHeight] = useState(600);
    const [isPlaying, setIsPlaying] = useState(true);

    // Data Generation Params
    const [rows, setRows] = useState(50); // Time slices (history length)
    const [cols, setCols] = useState(100); // Frequency bins
    const [updateRate, setUpdateRate] = useState(200); // ms between updates
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [signalStrength, setSignalStrength] = useState(50);
    const [signalProbability, setSignalProbability] = useState(0.02);

    // Theme & Visualization
    const [minColor, setMinColor] = useState('#0a0a1a'); // Deep dark blue/black
    const [maxColor, setMaxColor] = useState('#ff3333'); // Bright red
    const [axesColor, setAxesColor] = useState('#00e5ff');
    const [minRange, setMinRange] = useState(-100);
    const [maxRange, setMaxRange] = useState(-30);
    const [interpolate, setInterpolate] = useState(false);
    const [showAxes, setShowAxes] = useState(true);

    const [data, setData] = useState<SpectrogramData | null>(null);
    const dataRef = useRef<number[][]>([]);

    useEffect(() => {
        // Initialize history
        dataRef.current = generateMockSpectrogram(rows, cols, noiseLevel, signalStrength, signalProbability);
        updateData(dataRef.current);
    }, [rows, cols]); // Recreate if grid size changes

    const updateData = (matrix: number[][]) => {
        if (matrix.length === 0) return;

        // Generate pseudo timestamps and frequencies based on matrix size
        const timestamps = matrix.map((_, i) => i * updateRate);
        const freqStep = (2500 - 2400) / cols;
        const frequencies = Array.from({ length: cols }, (_, i) => 2400 + i * freqStep);

        setData({
            metadata: {
                sampleRate: 44100,
                fftSize: 1024,
                startTime: new Date().toISOString(),
                freqMin: 2400.0,
                freqMax: 2500.0,
                unit: "dBm"
            },
            axes: {
                frequencies,
                timestamps
            },
            data: matrix
        });
    };

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // Generate a new row of data
            const newRow = generateMockSpectrogram(1, cols, noiseLevel, signalStrength, signalProbability)[0];

            // Shift history
            const newMatrix = [...dataRef.current.slice(1), newRow];
            dataRef.current = newMatrix;

            updateData(newMatrix);
        }, updateRate);

        return () => clearInterval(interval);
    }, [isPlaying, updateRate, cols, noiseLevel, signalStrength, signalProbability]);

    const handleClear = () => {
        dataRef.current = generateMockSpectrogram(rows, cols, -200, 0, 0); // Silence
        updateData(dataRef.current);
    };

    return (
        <PlaygroundCard title="RF Spectrogram Simulator" height="auto">
            <ExampleContainer $height={containerHeight}>
                <SpectrogramCore
                    data={data}
                    theme={{
                        minColor,
                        maxColor,
                        backgroundColor: '#000000',
                        axesColor
                    }}
                    valueRange={[minRange, maxRange]}
                    interpolate={interpolate}
                    showAxes={showAxes}
                />
            </ExampleContainer>

            <PortalToPanel>
                <ControlsContainer>
                    <ControlSection>
                        <Label>Simulation Control</Label>
                        <ToggleControl
                            label={isPlaying ? "Running" : "Paused"}
                            checked={isPlaying}
                            onChange={setIsPlaying}
                        />
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <ControlButton $active={false} onClick={handleClear}>Clear Data</ControlButton>
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Signal Generator</Label>
                        <RangeControl label="Speed (Update Rate ms)" value={updateRate} onChange={setUpdateRate} min={50} max={1000} step={50} unit="ms" />
                        <RangeControl label="Noise Floor Adjust" value={noiseLevel} onChange={setNoiseLevel} min={-20} max={20} step={1} unit="dB" />
                        <RangeControl label="Signal Strength" value={signalStrength} onChange={setSignalStrength} min={10} max={80} step={5} unit="dB" />
                        <RangeControl label="Signal Probability" value={signalProbability} onChange={setSignalProbability} min={0.01} max={0.2} step={0.01} />
                    </ControlSection>

                    <ControlSection>
                        <Label>Grid Resolution</Label>
                        <RangeControl label="History (Time Slices)" value={rows} onChange={setRows} min={20} max={200} step={10} />
                        <RangeControl label="Frequency Bins" value={cols} onChange={setCols} min={50} max={500} step={10} />
                    </ControlSection>

                    <ControlSection>
                        <Label>Visual Mapping</Label>
                        <RangeControl label="Map Min (floor dB)" value={minRange} onChange={setMinRange} min={-120} max={-50} step={5} />
                        <RangeControl label="Map Max (peak dB)" value={maxRange} onChange={setMaxRange} min={-50} max={0} step={5} />
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ColorControl label="Floor Color (Noise)" value={minColor} onChange={setMinColor} />
                            <ColorControl label="Peak Color (Signal)" value={maxColor} onChange={setMaxColor} />
                            <ColorControl label="Axes/Grid Color" value={axesColor} onChange={setAxesColor} />
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Display Options</Label>
                        <ToggleControl label="Smooth Interpolation" checked={interpolate} onChange={setInterpolate} />
                        <ToggleControl label="Show Axes" checked={showAxes} onChange={setShowAxes} />
                        <div style={{ marginTop: '1rem' }}>
                            <RangeControl label="Container Size" value={containerHeight} onChange={setContainerHeight} min={300} max={800} step={10} unit="px" />
                        </div>
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default SpectrogramExample;
