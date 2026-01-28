'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Compass from './Compass';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';

import {
    ControlsContainer,
    ControlSection,
    RangeControl,
    ToggleControl,
    ColorControl,
    ControlButton
} from './controls/ControlWidgets';

const ExampleContainer = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000ff; /* Light background for contrast */
  position: relative;
  transition: height 0.3s ease;
`;

const CompassExample = () => {
    const [heading, setHeading] = useState(0);
    const [animate, setAnimate] = useState(true);
    const [showTicks, setShowTicks] = useState(true);
    const [duration, setDuration] = useState(800);
    const [primaryColor, setPrimaryColor] = useState('#007AFF');
    const [shadowColor, setShadowColor] = useState('#000000');
    const [containerHeight, setContainerHeight] = useState(500);
    const [tickLength, setTickLength] = useState(10);

    return (
        <PlaygroundCard title="Vector Compass" height="auto">
            <ExampleContainer $height={containerHeight}>
                <Compass
                    heading={heading}
                    animate={animate}
                    showTicks={showTicks}
                    tickLength={tickLength}
                    duration={duration}
                    primaryColor={primaryColor}
                    shadowColor={shadowColor}
                    onHeadingChange={setHeading}
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
                        <RangeControl
                            label="Heading"
                            value={Math.round(heading)}
                            onChange={setHeading}
                            min={0}
                            max={360}
                            unit="°"
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <ControlButton $active={heading === 0} onClick={() => setHeading(0)}>N</ControlButton>
                            <ControlButton $active={heading === 90} onClick={() => setHeading(90)}>E</ControlButton>
                            <ControlButton $active={heading === 180} onClick={() => setHeading(180)}>S</ControlButton>
                            <ControlButton $active={heading === 270} onClick={() => setHeading(270)}>W</ControlButton>
                        </div>
                    </ControlSection>

                    <ToggleControl
                        label="Animate Transitions"
                        checked={animate}
                        onChange={setAnimate}
                    />

                    <ToggleControl
                        label="Show Ticks"
                        checked={showTicks}
                        onChange={setShowTicks}
                    />

                    <RangeControl
                        label="Tick Size"
                        value={tickLength}
                        onChange={setTickLength}
                        min={2}
                        max={30}
                        unit="px"
                    />

                    <RangeControl
                        label="Duration"
                        value={duration}
                        onChange={setDuration}
                        min={100}
                        max={2000}
                        step={100}
                        unit="ms"
                    />

                    <ColorControl
                        label="Primary Color"
                        value={primaryColor}
                        onChange={setPrimaryColor}
                    />

                    <ColorControl
                        label="Shadow Color"
                        value={shadowColor}
                        onChange={setShadowColor}
                    />

                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default CompassExample;
