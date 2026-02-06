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
  background-color: #000000;
  border-radius: 8px;
  overflow: hidden;
  transition: height 0.3s ease;
`;

const BreathingExample = () => {
    // State
    const [isPlaying, setIsPlaying] = useState(true);
    const [inhaleColor, setInhaleColor] = useState('#60a5fa');
    const [exhaleColor, setExhaleColor] = useState('#1e3a8a');
    const [inhaleTextColor, setInhaleTextColor] = useState('#ffffff');
    const [exhaleTextColor, setExhaleTextColor] = useState('#e0f2fe');
    const [backgroundColor, setBackgroundColor] = useState('#1a1e2e');
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
    const [particleSize, setParticleSize] = useState(5);
    const [particleLifetime, setParticleLifetime] = useState(400);
    const [particleCount, setParticleCount] = useState(50);

    // Audio Settings
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [musicVolume, setMusicVolume] = useState(0.7);
    const [breathVolume, setBreathVolume] = useState(1.5);
    const [pingVolume, setPingVolume] = useState(1.0);

    // Track Options
    const TRACK_OPTIONS = [
        { label: 'Short Meditation (3m)', value: '/audio/meditation_music.mp3' },
        { label: 'Deep Focus (Ambient)', value: '/audio/music_2.mp3' },
        { label: ' Spiritual Flute Music', value: '/audio/music_3.mp3' }
    ];
    const [selectedTrack, setSelectedTrack] = useState(TRACK_OPTIONS[0].value);

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
                        inhaleColor: inhaleColor,
                        exhaleColor: exhaleColor,
                        inhaleTextColor: inhaleTextColor,
                        exhaleTextColor: exhaleTextColor,
                        backgroundColor: backgroundColor
                    }}
                    particleConfig={{
                        size: particleSize,
                        lifetime: particleLifetime,
                        count: particleCount
                    }}
                    audioConfig={{
                        enabled: isAudioEnabled,
                        volume: volume,
                        isMuted: isMuted,
                        musicVolume: musicVolume,
                        breathVolume: breathVolume,
                        pingVolume: pingVolume,
                        trackFile: selectedTrack
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
                            <ColorControl
                                label="Inhale Color"
                                value={inhaleColor}
                                onChange={setInhaleColor}
                            />
                            <ColorControl
                                label="Exhale Color"
                                value={exhaleColor}
                                onChange={setExhaleColor}
                            />
                            <ColorControl
                                label="Inhale Text Color"
                                value={inhaleTextColor}
                                onChange={setInhaleTextColor}
                            />
                            <ColorControl
                                label="Exhale Text Color"
                                value={exhaleTextColor}
                                onChange={setExhaleTextColor}
                            />
                            <ColorControl
                                label="Background Color"
                                value={backgroundColor}
                                onChange={setBackgroundColor}
                            />
                        </div>
                    </ControlSection>

                    <ControlSection>
                        <Label>Audio</Label>
                        <ToggleControl
                            label="Enable Audio"
                            checked={isAudioEnabled}
                            onChange={(val) => {
                                setIsAudioEnabled(val);
                                if (val) setIsMuted(false);
                            }}
                        />
                        <div style={{ opacity: isAudioEnabled ? 1 : 0.5, pointerEvents: isAudioEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>

                            <div style={{ marginBottom: '12px' }}>
                                <Label style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Backing Track</Label>
                                <select
                                    value={selectedTrack}
                                    onChange={(e) => setSelectedTrack(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        background: '#333',
                                        color: '#fff',
                                        border: '1px solid #555'
                                    }}
                                >
                                    {TRACK_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <ToggleControl
                                label={isMuted ? "Muted" : "Sound On"}
                                checked={!isMuted}
                                onChange={(val) => setIsMuted(!val)}
                            />
                            <RangeControl
                                label="Overall Volume"
                                value={volume}
                                onChange={setVolume}
                                min={0} max={1} step={0.05}
                            />
                            <RangeControl
                                label="Music Volume"
                                value={musicVolume}
                                onChange={setMusicVolume}
                                min={0} max={1} step={0.05}
                            />
                            <RangeControl
                                label="Breath SFX Level"
                                value={breathVolume}
                                onChange={setBreathVolume}
                                min={0} max={5} step={0.1}
                            />
                            <RangeControl
                                label="Chime Cues Level"
                                value={pingVolume}
                                onChange={setPingVolume}
                                min={0} max={3} step={0.1}
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
                            label="Density"
                            value={particleCount}
                            onChange={setParticleCount}
                            min={0} max={200} step={5}
                        />
                        <RangeControl
                            label="Lifetime"
                            value={particleLifetime}
                            onChange={setParticleLifetime}
                            min={20} max={700} step={10}
                        />
                    </ControlSection>
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default BreathingExample;
