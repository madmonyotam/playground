
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import LumenMemoryFlowCore, { MemoryWord } from './LumenMemoryFlow/LumenMemoryFlowCore';
import PlaygroundCard from './PlaygroundCard';
import { PortalToPanel } from '@/components/layout/PortalToPanel';
import {
    ControlsContainer,
    RangeControl,
    ColorControl,
    ToggleControl
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

const VOCAB = ["MEMORY", "LUMEN", "ECHO", "VOID", "SYNAPSE", "TRACE", "PULSE", "DRIFT", "CORE", "FLUX", "FRAGMENT", "DUST", "SIGNAL", "NOISE", "WAVE"];

const generateNewWord = (idOffset: number, baseColor: string, lifespan: number): MemoryWord => {
    return {
        id: `word-${Date.now()}-${idOffset}`,
        text: VOCAB[Math.floor(Math.random() * VOCAB.length)],
        size: 0.1 + Math.random() * 0.9, // 0.1 to 1.0
        blur: 0.3 + Math.random() * 0.5, // 0.5 to 1.0
        color: baseColor, // Could vary slightly
        // maxLife removed, governed by global prop
        createdAt: Date.now()
    };
};

const LumenMemoryFlowExample = () => {
    const [baseColor, setBaseColor] = useState('#0b1bb2ff');
    const [targetWordCount, setTargetWordCount] = useState(10);
    const [speed, setSpeed] = useState(0.5);
    const [lifespan, setLifespan] = useState(5000);
    const [containerHeight, setContainerHeight] = useState(500);
    const [showBounds, setShowBounds] = useState(false);

    const [words, setWords] = useState<MemoryWord[]>([]);
    const nextIdRef = useRef(0);

    // Word Manager Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setWords(prev => {
                const now = Date.now();
                // Remove dead words (though Core handles visual removal, we should clean up state)
                const livingWords = prev.filter(w => now - w.createdAt < lifespan + 2000); // +2s buffer for shatter animation

                if (livingWords.length < targetWordCount && Math.random() < 0.1) {
                    const newWord = generateNewWord(nextIdRef.current++, baseColor, lifespan);
                    return [...livingWords, newWord];
                }
                return livingWords.length !== prev.length ? livingWords : prev;
            });
        }, 100); // Check every 100ms

        return () => clearInterval(interval);
    }, [targetWordCount, baseColor, lifespan]);

    return (
        <PlaygroundCard title="Lumen Memory Flow" height="auto">
            <ExampleContainer $height={containerHeight} style={{ border: showBounds ? '1px solid #333' : 'none' }}>
                <LumenMemoryFlowCore
                    words={words}
                    speed={speed}
                />
            </ExampleContainer>

            <PortalToPanel>
                <ControlsContainer>
                    <ColorControl
                        label="Memory Color"
                        value={baseColor}
                        onChange={setBaseColor}
                    />
                    <RangeControl
                        label="Active Memories"
                        value={targetWordCount}
                        onChange={setTargetWordCount}
                        min={5}
                        max={50}
                        step={1}
                    />
                    <RangeControl
                        label="Flow Speed"
                        value={speed}
                        onChange={setSpeed}
                        min={0.1}
                        max={3}
                        step={0.1}
                    />
                    <RangeControl
                        label="Memory Lifespan"
                        value={lifespan}
                        onChange={setLifespan}
                        min={1000}
                        max={60000}
                        step={1000}
                        unit="ms"
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
                    <ToggleControl
                        label="Show Bounds"
                        checked={showBounds}
                        onChange={setShowBounds}
                    />
                </ControlsContainer>
            </PortalToPanel>
        </PlaygroundCard>
    );
};

export default LumenMemoryFlowExample;
