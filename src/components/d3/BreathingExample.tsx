'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import BreathingCore, { StageDurations } from './Breathing/BreathingCore';
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
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  transition: height 0.3s ease;
`;

const BreathingExample = () => {
    // State
    const [isPlaying, setIsPlaying] = useState(true);
    const [themeHue, setThemeHue] = useState(190); // Teal by default
    const [textColor, setTextColor] = useState('#ffffff');
    const [containerHeight, setContainerHeight] = useState(600);

    // Stage Durations (seconds)
    // Inhale: 4s, Hold: 2s, Exhale: 4s, Hold: 2s (Box breathing variant)
    const [durations, setDurations] = useState<StageDurations>({
        inhale: 4,
        holdFull: 4,
        exhale: 4,
        holdEmpty: 4
    });

    // Counter Settings
    type CounterMode = 'timer' | 'breaths' | 'off';
    const [counterMode, setCounterMode] = useState<CounterMode>('timer');
    const [breathCount, setBreathCount] = useState(0);

    // Particle Settings
    const [particleSize, setParticleSize] = useState(2);
    const [particleLifetime, setParticleLifetime] = useState(100);

    // Helpers to update durations safely
    const updateDuration = (key: keyof StageDurations, val: number) => {
        setDurations((prev: StageDurations) => ({ ...prev, [key]: val }));
    };

    // Derived durations in MS for the Core component
    const durationsMs = {
        inhale: durations.inhale * 1000,
        holdFull: durations.holdFull * 1000,
        exhale: durations.exhale * 1000,
        holdEmpty: durations.holdEmpty * 1000
    };

    return (
        <PlaygroundCard title="Meditative Breathing" height="auto">
            <ExampleContainer $height={containerHeight}>
                <BreathingCore
                    isPlaying={isPlaying}
                    stageDurations={durationsMs}
                    counter={{
                        mode: counterMode,
                        currentValue: breathCount
                    }}
                    theme={{
                        primaryHue: themeHue,
                        textColor: textColor
                    }}
                    particleConfig={{
                        size: particleSize,
                        lifetime: particleLifetime
                    }}
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
                        <Label>Playback</Label>
                        <ToggleControl
                            label={isPlaying ? "Playing" : "Paused"}
                            checked={isPlaying}
                            onChange={setIsPlaying}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                            <ControlButton $active={false} onClick={() => {
                                setIsPlaying(false);
                                setTimeout(() => setIsPlaying(true), 100);
                            }}>
                                Restart Cycle
                            </ControlButton>
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Cycle Phases (seconds)</Label>
                        <RangeControl
                            label="Inhale"
                            value={durations.inhale}
                            onChange={(v: number) => updateDuration('inhale', v)}
                            min={1} max={10} step={0.5} unit="s"
                        />
                        <RangeControl
                            label="Hold (Full)"
                            value={durations.holdFull}
                            onChange={(v: number) => updateDuration('holdFull', v)}
                            min={0} max={10} step={0.5} unit="s"
                        />
                        <RangeControl
                            label="Exhale"
                            value={durations.exhale}
                            onChange={(v: number) => updateDuration('exhale', v)}
                            min={1} max={10} step={0.5} unit="s"
                        />
                        <RangeControl
                            label="Hold (Empty)"
                            value={durations.holdEmpty}
                            onChange={(v: number) => updateDuration('holdEmpty', v)}
                            min={0} max={10} step={0.5} unit="s"
                        />
                    </ControlSection>

                    <ControlSection>
                        <Label>HUD & Theme</Label>
                        <Label style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Counter Mode</Label>
                        <ButtonGroup>
                            <ControlButton
                                $active={counterMode === 'timer'}
                                onClick={() => setCounterMode('timer')}
                            >
                                Timer
                            </ControlButton>
                            <ControlButton
                                $active={counterMode === 'breaths'}
                                onClick={() => setCounterMode('breaths')}
                            >
                                Breaths
                            </ControlButton>
                            <ControlButton
                                $active={counterMode === 'off'}
                                onClick={() => setCounterMode('off')}
                            >
                                Off
                            </ControlButton>
                        </ButtonGroup>

                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <RangeControl
                                label="Theme Hue"
                                value={themeHue}
                                onChange={setThemeHue}
                                min={0} max={360} step={5}
                            />
                            <ColorControl
                                label="Text Color"
                                value={textColor}
                                onChange={setTextColor}
                            />
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Particles</Label>
                        <RangeControl
                            label="Size"
                            value={particleSize}
                            onChange={setParticleSize}
                            min={1} max={10} step={0.5} unit="px"
                        />
                        <RangeControl
                            label="Lifetime"
                            value={particleLifetime}
                            onChange={setParticleLifetime}
                            min={20} max={300} step={10}
                        />
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default BreathingExample;
