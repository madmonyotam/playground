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
    const [containerHeight, setContainerHeight] = useState(600);

    // Stage Durations (ms)
    // Inhale: 4s, Hold: 4s, Exhale: 4s, Hold: 2s (Box breathing variant)
    const [durations, setDurations] = useState<StageDurations>({
        inhale: 4000,
        holdFull: 2000,
        exhale: 4000,
        holdEmpty: 2000
    });

    // Counter Settings
    type CounterMode = 'seconds-up' | 'seconds-down' | 'breaths' | 'off';
    const [counterMode, setCounterMode] = useState<CounterMode>('seconds-down');
    const [breathCount, setBreathCount] = useState(0);

    // Helpers to update durations safely
    const updateDuration = (key: keyof StageDurations, val: number) => {
        setDurations((prev: StageDurations) => ({ ...prev, [key]: val }));
    };

    return (
        <PlaygroundCard title="Meditative Breathing" height="auto">
            <ExampleContainer $height={containerHeight}>
                <BreathingCore
                    isPlaying={isPlaying}
                    stageDurations={durations}
                    counter={{
                        mode: counterMode,
                        currentValue: breathCount
                    }}
                    theme={{ primaryHue: themeHue }}
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
                                // Reset logic involves re-mounting or forcing a reset in Core.
                                // For now, we can toggle play off/on or signal a reset.
                                // A simple way is to key the component, but that's heavy.
                                // Passed props change is better.
                                setIsPlaying(false);
                                setTimeout(() => setIsPlaying(true), 100);
                            }}>
                                Restart Cycle
                            </ControlButton>
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Cycle Phases (ms)</Label>
                        <RangeControl
                            label="Inhale"
                            value={durations.inhale}
                            onChange={(v: number) => updateDuration('inhale', v)}
                            min={1000} max={10000} step={500} unit="ms"
                        />
                        <RangeControl
                            label="Hold (Full)"
                            value={durations.holdFull}
                            onChange={(v: number) => updateDuration('holdFull', v)}
                            min={0} max={10000} step={500} unit="ms"
                        />
                        <RangeControl
                            label="Exhale"
                            value={durations.exhale}
                            onChange={(v: number) => updateDuration('exhale', v)}
                            min={1000} max={10000} step={500} unit="ms"
                        />
                        <RangeControl
                            label="Hold (Empty)"
                            value={durations.holdEmpty}
                            onChange={(v: number) => updateDuration('holdEmpty', v)}
                            min={0} max={10000} step={500} unit="ms"
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
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default BreathingExample;
