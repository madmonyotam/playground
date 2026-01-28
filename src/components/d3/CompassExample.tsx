'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Compass from './Compass';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import { PropertiesPanel } from '@/components/layout/PropertiesPanel';

const ExampleContainer = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa; /* Light background for contrast */
  position: relative;
  transition: height 0.3s ease;
  
  /* Frosted glass bg simulation */
  background: radial-gradient(circle at center, #e6f7ff 0%, #f0f4f8 100%);
`;


const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }
  
  input[type="range"] {
    width: 100%;
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
  
  span {
    font-size: 0.9rem;
    color: #333;
  }
`;

const Button = styled.button`
    padding: 0.5rem 1rem;
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
        background-color: #0056b3;
    }
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
                    <ControlGroup>
                        <label>Container Size: {containerHeight}px</label>
                        <input
                            type="range"
                            min="300"
                            max="800"
                            step="10"
                            value={containerHeight}
                            onChange={(e) => setContainerHeight(Number(e.target.value))}
                        />
                    </ControlGroup>

                    <ControlGroup>
                        <label>Heading: {Math.round(heading)}°</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={Math.round(heading)}
                            onChange={(e) => setHeading(Number(e.target.value))}
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <Button onClick={() => setHeading(0)}>N</Button>
                            <Button onClick={() => setHeading(90)}>E</Button>
                            <Button onClick={() => setHeading(180)}>S</Button>
                            <Button onClick={() => setHeading(270)}>W</Button>
                        </div>
                    </ControlGroup>

                    <ControlGroup>
                        <Toggle>
                            <input
                                type="checkbox"
                                checked={animate}
                                onChange={(e) => setAnimate(e.target.checked)}
                            />
                            <span>Animate Transitions</span>
                        </Toggle>
                    </ControlGroup>

                    <ControlGroup>
                        <Toggle>
                            <input
                                type="checkbox"
                                checked={showTicks}
                                onChange={(e) => setShowTicks(e.target.checked)}
                            />
                            <span>Show Ticks</span>
                        </Toggle>
                    </ControlGroup>

                    <ControlGroup>
                        <label>Tick Size: {tickLength}px</label>
                        <input
                            type="range"
                            min="2"
                            max="30"
                            value={tickLength}
                            onChange={(e) => setTickLength(Number(e.target.value))}
                        />
                    </ControlGroup>

                    <ControlGroup>
                        <label>Duration: {duration}ms</label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            step="100"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </ControlGroup>

                    <ControlGroup>
                        <label>Primary Color</label>
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                        />
                    </ControlGroup>

                    <ControlGroup>
                        <label>Shadow Color</label>
                        <input
                            type="color"
                            value={shadowColor}
                            onChange={(e) => setShadowColor(e.target.value)}
                        />
                    </ControlGroup>

                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default CompassExample;
