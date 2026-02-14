'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import MeshedSphereCore from './MeshedSphere/MeshedSphereCore';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import {
    ControlsContainer,
    ControlSection,
    RangeControl,
    ToggleControl,
    ColorControl,
    Label
} from './controls/ControlWidgets';

const ExampleContainer = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  position: relative;
  background-color: #0b0e14;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MeshedSphereExample = () => {
    const [complexity, setComplexity] = useState(60);
    const [rotationInterval, setRotationInterval] = useState(4000);
    const [movementSize, setMovementSize] = useState(3);
    const [color, setColor] = useState('#00f2ff');
    const [isPlaying, setIsPlaying] = useState(true);
    const [containerHeight, setContainerHeight] = useState(600);

    return (
        <PlaygroundCard title="Meshed Sphere Matrix" height="auto">
            <ExampleContainer $height={containerHeight}>
                <MeshedSphereCore
                    complexity={complexity}
                    rotationInterval={rotationInterval}
                    movementSize={movementSize}
                    color={color}
                    isPlaying={isPlaying}
                />
            </ExampleContainer>

            <PortalToPanel>
                <ControlsContainer>
                    <RangeControl
                        label="Complexity"
                        value={complexity}
                        onChange={setComplexity}
                        min={1}
                        max={100}
                        unit="%"
                    />
                    <RangeControl
                        label="Rotation Change Interval"
                        value={rotationInterval}
                        onChange={setRotationInterval}
                        min={1000}
                        max={10000}
                        step={500}
                        unit="ms"
                    />
                    <RangeControl
                        label="Movement Intensity"
                        value={movementSize}
                        onChange={setMovementSize}
                        min={0}
                        max={10}
                        step={0.5}
                    />
                    <ColorControl
                        label="Aura Color"
                        value={color}
                        onChange={setColor}
                    />
                    <ToggleControl
                        label={isPlaying ? "Active" : "Static"}
                        checked={isPlaying}
                        onChange={setIsPlaying}
                    />
                    <RangeControl
                        label="Stage Height"
                        value={containerHeight}
                        onChange={setContainerHeight}
                        min={300}
                        max={800}
                        step={50}
                        unit="px"
                    />
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default MeshedSphereExample;
