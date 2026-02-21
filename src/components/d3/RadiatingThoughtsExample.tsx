'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import RadiatingThoughtsCore from './RadiatingThoughts/RadiatingThoughtsCore';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import {
    ControlsContainer,
    ControlSection,
    RangeControl,
    ColorControl,
    Label
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

const RadiatingThoughtsExample = () => {
    const [containerHeight, setContainerHeight] = useState(600);

    // Core Props
    const [maxThoughts, setMaxThoughts] = useState(150);
    const [speed, setSpeed] = useState(1.5);
    const [thickness, setThickness] = useState(2.0);
    const [distance, setDistance] = useState(400);
    const [opacity, setOpacity] = useState(0.8);
    const [tailLength, setTailLength] = useState(20);
    const [dotSize, setDotSize] = useState(4.0);

    // Colors
    const [color1, setColor1] = useState('#123661ff');
    const [color2, setColor2] = useState('#2e1774ff');
    const [color3, setColor3] = useState('#2117a7ff');
    const [color4, setColor4] = useState('#241842ff');

    return (
        <PlaygroundCard title="Radiating Thoughts Flow" height="auto">
            <ExampleContainer $height={containerHeight}>
                <RadiatingThoughtsCore
                    colors={[color1, color2, color3, color4]}
                    maxThoughts={maxThoughts}
                    speed={speed}
                    thickness={thickness}
                    distance={distance}
                    opacity={opacity}
                    tailLength={tailLength}
                    dotSize={dotSize}
                />
            </ExampleContainer>

            <PortalToPanel>
                <ControlsContainer>
                    <RangeControl
                        label="Container Size"
                        value={containerHeight}
                        onChange={setContainerHeight}
                        min={300}
                        max={800}
                        step={10}
                        unit="px"
                    />

                    <ControlSection>
                        <Label>Flow Dynamics</Label>
                        <RangeControl
                            label="Max Thoughts"
                            value={maxThoughts}
                            onChange={setMaxThoughts}
                            min={10} max={500} step={10}
                        />
                        <RangeControl
                            label="Speed"
                            value={speed}
                            onChange={setSpeed}
                            min={0.1} max={10} step={0.1}
                        />
                        <RangeControl
                            label="Travel Distance"
                            value={distance}
                            onChange={setDistance}
                            min={50} max={1000} step={10} unit="px"
                        />
                    </ControlSection>

                    <ControlSection>
                        <Label>Appearance</Label>
                        <RangeControl
                            label="Thickness"
                            value={thickness}
                            onChange={setThickness}
                            min={0.5} max={10} step={0.5} unit="px"
                        />
                        <RangeControl
                            label="Tail Length"
                            value={tailLength}
                            onChange={setTailLength}
                            min={2} max={100} step={1}
                        />
                        <RangeControl
                            label="Dot Size"
                            value={dotSize}
                            onChange={setDotSize}
                            min={0} max={20} step={0.5} unit="px"
                        />
                        <RangeControl
                            label="Opacity (Max)"
                            value={opacity}
                            onChange={setOpacity}
                            min={0.1} max={1} step={0.05}
                        />
                    </ControlSection>

                    <ControlSection>
                        <Label>Theme Colors</Label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                            <ColorControl label="Color 1" value={color1} onChange={setColor1} />
                            <ColorControl label="Color 2" value={color2} onChange={setColor2} />
                            <ColorControl label="Color 3" value={color3} onChange={setColor3} />
                            <ColorControl label="Color 4" value={color4} onChange={setColor4} />
                        </div>
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default RadiatingThoughtsExample;
