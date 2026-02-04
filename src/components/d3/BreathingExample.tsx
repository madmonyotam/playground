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
    const [containerHeight, setContainerHeight] = useState(600);

    // Stage Durations (seconds)
    // Inhale: 4s, Hold: 2s, Exhale: 4s, Hold: 2s (Box breathing variant)
    const [durations, setDurations] = useState<StageDurations>({
        inhale: 4,
        holdFull: 2,
        exhale: 4,
        holdEmpty: 2
    });

    // Counter Settings
    type CounterMode = 'seconds-up' | 'seconds-down' | 'breaths' | 'off';
    const [counterMode, setCounterMode] = useState<CounterMode>('seconds-down');
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
                    theme={{ primaryHue: themeHue }}
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
                                $active={counterMode === 'seconds-up'}
                                onClick={() => setCounterMode('seconds-up')}
                            >
                                Up
                            </ControlButton>
                            <ControlButton
                                $active={counterMode === 'seconds-down'}
                                onClick={() => setCounterMode('seconds-down')}
                            >
                                Down
                            </ControlButton>
                            <ControlButton
                                $active={counterMode === 'off'}
                                onClick={() => setCounterMode('off')}
                            >
                                Off
                            </ControlButton>
                        </ButtonGroup>

                        <div style={{ marginTop: '1rem' }}>
                            <RangeControl
                                label="Theme Hue"
                                value={themeHue}
                                onChange={setThemeHue}
                                min={0} max={360} step={5}
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
