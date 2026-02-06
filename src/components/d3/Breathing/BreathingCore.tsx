import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import BaseChart from '../BaseChart';
import { BreathingAudio } from './BreathingAudio';

// --- Styled Components ---

const Container = styled.div<{ $bg: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ $bg }) => {
        const color = d3.rgb($bg);
        return `radial-gradient(circle at center, ${color.toString()} 0%, ${color.darker(2).toString()} 100%)`;
    }};
  overflow: hidden;
  color: #fff;
  font-family: 'Inter', sans-serif;
`;

const HUDText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  gap: 1rem;
`;

const PhaseLabel = styled.div<{ $textColor?: string; $color: string }>`
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  color: ${({ $textColor, $color }) => $textColor || $color};
  text-shadow: 0 0 10px ${({ $color }) => $color};
`;

const CounterText = styled.div<{ $textColor?: string; $color: string }>`
  font-size: 4rem;
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: ${({ $textColor, $color }) => $textColor || $color};
  text-shadow: 0 0 15px ${({ $color }) => $color};
`;

// --- Types ---

export interface StageDurations {
    inhale: number;
    holdFull: number;
    exhale: number;
    holdEmpty: number;
}

export interface BreathingComponentProps {
    isPlaying: boolean;
    stageDurations: StageDurations;
    counter: {
        mode: 'timer' | 'breaths' | 'off';
        currentValue?: number;
    };
    theme?: {
        inhaleColor: string;
        exhaleColor: string;
        inhaleTextColor: string;
        exhaleTextColor: string;
        backgroundColor?: string;
    };
    particleConfig?: {
        size?: number;
        lifetime?: number;
        count?: number;
    };
    audioConfig?: {
        enabled: boolean;
        volume: number;
        isMuted: boolean;
        musicVolume?: number;
        breathVolume?: number;
        pingVolume?: number;
        trackFile?: string;
    };
}

// --- Utils ---

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 };

const calculateCycleState = (elapsed: number, cycleTime: number, stageDurations: StageDurations) => {
    const tCycle = elapsed % cycleTime;
    let stage = 'inhale';
    let stageProgress = 0;
    let tInStage = tCycle;

    if (tInStage < stageDurations.inhale) {
        stage = 'inhale';
        stageProgress = tInStage / stageDurations.inhale;
        stageProgress = d3.easeQuadInOut(stageProgress);
    } else {
        tInStage -= stageDurations.inhale;
        if (tInStage < stageDurations.holdFull) {
            stage = 'holdFull';
            stageProgress = tInStage / stageDurations.holdFull;
        } else {
            tInStage -= stageDurations.holdFull;
            if (tInStage < stageDurations.exhale) {
                stage = 'exhale';
                stageProgress = tInStage / stageDurations.exhale;
                stageProgress = d3.easeQuadInOut(stageProgress);
            } else {
                tInStage -= stageDurations.exhale;
                stage = 'holdEmpty';
                stageProgress = tInStage / stageDurations.holdEmpty;
            }
        }
    }
    return { stage, stageProgress, tCycle };
};

const getDisplayText = (
    mode: 'timer' | 'breaths' | 'off',
    tCycle: number,
    elapsed: number,
    stage: string,
    stageDurations: StageDurations,
    currentValue?: number
) => {
    if (mode === 'timer') {
        let dur = 0;
        let currentT = 0;
        if (stage === 'inhale') { dur = stageDurations.inhale; currentT = tCycle; }
        else if (stage === 'holdFull') { dur = stageDurations.holdFull; currentT = tCycle - stageDurations.inhale; }
        else if (stage === 'exhale') { dur = stageDurations.exhale; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull; }
        else { dur = stageDurations.holdEmpty; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull - stageDurations.exhale; }

        return Math.ceil((dur - currentT) / 1000).toString();
    } else if (mode === 'breaths') {
        const cycleTime = stageDurations.inhale + stageDurations.holdFull + stageDurations.exhale + stageDurations.holdEmpty;
        return Math.floor(elapsed / cycleTime).toString();
    }
    return '';
};

const setupDefs = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    if (g.select('defs').empty()) {
        const defs = g.append('defs');

        const filter = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '8')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        defs.append('radialGradient').attr('id', 'coreGradient');
        defs.append('radialGradient').attr('id', 'particleGradient');
        defs.append('radialGradient').attr('id', 'auraGradient');
    }
};

const updateGradients = (g: d3.Selection<SVGGElement, unknown, null, undefined>, color: string) => {
    const defs = g.select('defs');
    if (defs.empty()) return;

    const baseColor = d3.rgb(color);
    const lighterColor = baseColor.brighter(1);
    const darkerColor = baseColor.darker(2);

    const coreGradient = defs.select('#coreGradient');
    coreGradient.html('');
    // Use lighter version for center, exact base color for body, and darker fading out for edge
    coreGradient.append('stop').attr('offset', '0%').attr('stop-color', lighterColor.toString()).attr('stop-opacity', 0.9);
    coreGradient.append('stop').attr('offset', '40%').attr('stop-color', baseColor.toString()).attr('stop-opacity', 0.7);
    coreGradient.append('stop').attr('offset', '100%').attr('stop-color', darkerColor.toString()).attr('stop-opacity', 0);

    const particleGradient = defs.select('#particleGradient');
    particleGradient.html('');
    particleGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 1);
    particleGradient.append('stop').attr('offset', '100%').attr('stop-color', baseColor.toString()).attr('stop-opacity', 0);

    const auraGradient = defs.select('#auraGradient');
    auraGradient.html('');
    auraGradient.append('stop').attr('offset', '50%').attr('stop-color', darkerColor.toString()).attr('stop-opacity', 0.15);
    auraGradient.append('stop').attr('offset', '100%').attr('stop-color', darkerColor.darker(1).toString()).attr('stop-opacity', 0);
};

// --- Draw Functions ---

const drawBlob = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    center: { x: number; y: number },
    elapsed: number,
    stage: string,
    stageProgress: number,
    baseRadius: number,
    maxGrowth: number,
    blobConfig: any
) => {
    let expansion = 0;
    if (stage === 'inhale') expansion = stageProgress;
    else if (stage === 'holdFull') expansion = 1;
    else if (stage === 'exhale') expansion = 1 - stageProgress;
    else expansion = 0;

    const currentRadius = baseRadius + (expansion * maxGrowth);

    const points: [number, number][] = [];
    const angleStep = (Math.PI * 2) / blobConfig.points;
    const timeVal = elapsed * blobConfig.noiseSpeed;

    for (let i = 0; i < blobConfig.points; i++) {
        const angle = i * angleStep;
        const noise = Math.sin(i * 0.5 + timeVal) * Math.cos(i * 0.3 - timeVal * 0.5) * blobConfig.noiseAmplitude;
        const microPulse = (stage === 'holdFull' || stage === 'holdEmpty') ? Math.sin(elapsed * 0.005) * 2 : 0;
        points.push([angle, currentRadius + noise + microPulse]);
    }

    const lineGenerator = d3.lineRadial<[number, number]>()
        .angle(d => d[0])
        .radius(d => d[1])
        .curve(d3.curveBasisClosed);
    const pathData = lineGenerator(points);

    const mainG = g.selectAll<SVGGElement, unknown>('g.main-group')
        .data([null])
        .join('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${center.x},${center.y})`);

    const blob = mainG.selectAll<SVGPathElement, string>('path.blob').data([pathData || '']);
    blob.enter().append('path')
        .attr('class', 'blob')
        .attr('fill', 'url(#coreGradient)')
        .attr('filter', 'url(#glow)')
        .merge(blob)
        .attr('d', d => d);

    return mainG;
};

const drawProgressRing = (
    mainG: d3.Selection<any, any, any, any>,
    radius: number,
    color: string,
    stageProgress: number
) => {
    const arcGen = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius + 4)
        .startAngle(0)
        .cornerRadius(2);

    const endAngle = stageProgress * 2 * Math.PI;

    const bgArcGen = d3.arc().innerRadius(radius).outerRadius(radius + 4).startAngle(0).endAngle(2 * Math.PI);
    const bgRing = mainG.selectAll('path.bg-ring').data([0]);
    bgRing.enter().append('path').attr('class', 'bg-ring').attr('fill', '#ffffff10')
        .merge(bgRing as any).attr('d', bgArcGen as any);

    const ring = mainG.selectAll('path.progress-ring').data([endAngle]);
    ring.enter().append('path').attr('class', 'progress-ring')
        .merge(ring as any)
        .attr('fill', color)
        .attr('d', (d) => arcGen({ endAngle: d } as any));
};

const updateAndDrawParticles = (
    mainG: d3.Selection<any, any, any, any>,
    particles: Array<any>,
    particleIdCounter: React.MutableRefObject<number>,
    stage: string,
    minDim: number,
    particleConfig: { size: number, lifetime: number, count?: number }
) => {
    const particleCreationDist = minDim * 0.5;
    const particleEndDist = minDim * 0.1;
    const pLifetime = particleConfig.lifetime;
    const pSize = particleConfig.size;
    const count = particleConfig.count ?? 50;
    const pPerFrame = count / 60;
    const toCreate = Math.floor(pPerFrame) + (Math.random() < (pPerFrame % 1) ? 1 : 0);

    // Emission
    if (toCreate > 0) {
        for (let i = 0; i < toCreate; i++) {
            const angle = Math.random() * Math.PI * 2;
            if (stage === 'inhale') {
                const r = minDim * (0.55 + Math.random() * 0.1);
                particles.push({
                    id: particleIdCounter.current++,
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r,
                    vx: 0, vy: 0,
                    life: pLifetime, maxLife: pLifetime, opacity: 0
                });
            } else if (stage === 'exhale') {
                const r = particleEndDist;
                particles.push({
                    id: particleIdCounter.current++,
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r,
                    vx: Math.cos(angle) * 3.0,
                    vy: Math.sin(angle) * 3.0,
                    life: pLifetime, maxLife: pLifetime, opacity: 0
                });
            }
        }
    }

    // Update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (stage === 'inhale') {
            // Target-based movement but update velocity for momentum-like feel
            const targetVx = -p.x * 0.02;
            const targetVy = -p.y * 0.02;
            p.vx = targetVx;
            p.vy = targetVy;
            p.life -= 0.5;
            p.opacity = Math.min(1, p.opacity + 0.02);
        } else if (stage === 'exhale') {
            // Standard outward velocity set at creation
            p.life -= 1;
            p.opacity = p.life / p.maxLife;
        } else {
            // Hold phases: Apply damping to current velocity + a very subtle Brownian/drift motion
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Add tiny random drift
            p.vx += (Math.random() - 0.5) * 0.1;
            p.vy += (Math.random() - 0.5) * 0.1;

            p.life -= 0.25; // Slower decay during holds
            p.opacity = Math.max(0.1, p.life / p.maxLife);
        }

        // Apply calculated velocity
        p.x += p.vx;
        p.y += p.vy;

        p.currentVx = p.vx;
        p.currentVy = p.vy;

        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        const maxDist = minDim * 0.65;

        // Condition for removal
        if (p.life <= 0 || (stage === 'inhale' && dist < 20) || dist > maxDist) {
            particles.splice(i, 1);
        }
    }

    // Draw
    const particleSel = mainG.selectAll('line.particle').data(particles, (d: any) => d.id);

    particleSel.enter().append('line')
        .attr('class', 'particle')
        .attr('stroke', 'url(#particleGradient)')
        .attr('stroke-linecap', 'round')
        .merge(particleSel as any)
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.x - d.currentVx * 3)
        .attr('y2', d => d.y - d.currentVy * 3)
        .attr('stroke-opacity', d => d.opacity)
        .attr('stroke-width', pSize * 2);

    particleSel.exit().remove();
};

// --- Component ---

const BreathingCore = ({
    isPlaying,
    stageDurations,
    counter,
    theme = { inhaleColor: '#60a5fa', exhaleColor: '#1e3a8a', inhaleTextColor: '#ffffff', exhaleTextColor: '#e0f2fe' },
    particleConfig = { size: 2, lifetime: 100 },
    audioConfig = { enabled: false, volume: 0.5, isMuted: false }
}: BreathingComponentProps) => {
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const animationFrameRef = useRef<number | undefined>(undefined);

    const [drawingContext, setDrawingContext] = useState<{
        selection: d3.Selection<SVGGElement, unknown, null, undefined>;
        width: number;
        height: number;
    } | null>(null);

    const handleReady = useCallback((
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => {
        setDrawingContext({ selection, width: dimensions.width, height: dimensions.height });
    }, []);

    const particlesRef = useRef<Array<any>>([]);
    const particleIdCounter = useRef(0);
    const lastStageRef = useRef<string>('');

    const [hudState, setHudState] = React.useState<{ phase: string; displayValue: string; currentColor: string; currentTextColor: string }>({
        phase: 'Inhale',
        displayValue: '',
        currentColor: theme.inhaleColor,
        currentTextColor: theme.inhaleTextColor
    });

    const audioRef = useRef<BreathingAudio | null>(null);

    // 1. Lifecycle management (mount/unmount)
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new BreathingAudio();
        }
        return () => {
            audioRef.current?.stop();
        };
    }, []); // Only once

    // 2. Track Management
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const track = audioConfig.trackFile || '/audio/meditation_music.mp3';
        audio.load(track);
    }, [audioConfig.trackFile]);

    // 3. Playback/Params Management
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.setVolume(audioConfig.volume);
        audio.setMute(audioConfig.isMuted);

        if (audioConfig.musicVolume !== undefined) {
            audio.setTrackVolume(audioConfig.musicVolume);
        }

        if (audioConfig.breathVolume !== undefined) {
            audio.setBreathVolume(audioConfig.breathVolume);
        }

        if (audioConfig.pingVolume !== undefined) {
            audio.setPingVolume(audioConfig.pingVolume);
        }

        if (audioConfig.enabled && isPlaying) {
            audio.start();
        } else {
            audio.stop();
        }
    }, [audioConfig.enabled, audioConfig.volume, audioConfig.isMuted, audioConfig.musicVolume, audioConfig.breathVolume, audioConfig.pingVolume, isPlaying]);


    const blobConfig = useMemo(() => ({
        points: 20,
        baseRadius: 120,
        noiseSpeed: 0.002,
        noiseAmplitude: 15
    }), []);

    const cycleTime = useMemo(() =>
        stageDurations.inhale + stageDurations.holdFull + stageDurations.exhale + stageDurations.holdEmpty
        , [stageDurations]);

    // Setup Defs
    useEffect(() => {
        if (!drawingContext) return;
        const { selection: g } = drawingContext;
        setupDefs(g);
    }, [drawingContext]);

    // Initial Gradient Setup
    useEffect(() => {
        if (!drawingContext) return;
        const { selection: g } = drawingContext;
        updateGradients(g, theme.inhaleColor); // Start with inhale color
    }, [drawingContext]);

    // Animation Loop
    useEffect(() => {
        if (!drawingContext) return;

        if (isPlaying) {
            lastFrameTimeRef.current = performance.now();
            const animate = (now: number) => {
                const delta = now - lastFrameTimeRef.current;
                lastFrameTimeRef.current = now;
                timeRef.current += delta;
                drawFrame(timeRef.current);
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            drawFrame(timeRef.current);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, stageDurations, theme, drawingContext, audioConfig.enabled]);

    const drawFrame = (elapsed: number) => {
        if (!drawingContext) return;
        const { selection: g, width, height } = drawingContext;
        const center = { x: width / 2, y: height / 2 };

        const minDim = Math.min(width, height);
        const blobBaseRadius = minDim * 0.25;
        const blobMaxGrowth = minDim * 0.15;
        const ringRadius = minDim * 0.42;

        const { stage, stageProgress, tCycle } = calculateCycleState(elapsed, cycleTime, stageDurations);

        if (audioRef.current && audioConfig.enabled) {
            audioRef.current.update(stage, stageProgress);

            // Detection of stage transition
            if (stage !== lastStageRef.current) {
                audioRef.current.playPing(stage);
                lastStageRef.current = stage;
            }
        }

        // Interpolate Color
        let colorProgress = 0;
        if (stage === 'inhale') colorProgress = stageProgress;
        else if (stage === 'holdFull') colorProgress = 1;
        else if (stage === 'exhale') colorProgress = 1 - stageProgress;
        else colorProgress = 0;

        const currentColor = d3.interpolateRgb(theme.exhaleColor, theme.inhaleColor)(colorProgress);
        const currentTextColor = d3.interpolateRgb(theme.exhaleTextColor, theme.inhaleTextColor)(colorProgress);

        updateGradients(g, currentColor);


        const textVal = getDisplayText(counter.mode, tCycle, elapsed, stage, stageDurations, counter.currentValue);

        setHudState(prev => {
            const newPhase = stage === 'holdFull' ? 'Hold' : stage === 'holdEmpty' ? 'Hold' : stage.charAt(0).toUpperCase() + stage.slice(1);
            if (prev.phase !== newPhase || prev.displayValue !== textVal || prev.currentColor !== currentColor || prev.currentTextColor !== currentTextColor) {
                return { phase: newPhase, displayValue: textVal, currentColor, currentTextColor };
            }
            return prev;
        });

        const mainG = drawBlob(g, center, elapsed, stage, stageProgress, blobBaseRadius, blobMaxGrowth, blobConfig);

        drawProgressRing(mainG, ringRadius, currentColor, stageProgress);

        const safeParticleConfig = {
            size: particleConfig.size || 2,
            lifetime: particleConfig.lifetime || 100,
            count: particleConfig.count
        };
        updateAndDrawParticles(mainG, particlesRef.current, particleIdCounter, stage, minDim, safeParticleConfig);
    };

    return (
        <Container $bg={theme.backgroundColor || '#1a1e2e'}>
            <BaseChart
                onReady={handleReady}
                margin={zeroMargin}
            />
            <HUDText>
                <PhaseLabel $color={hudState.currentTextColor}>{hudState.phase}</PhaseLabel>
                {counter.mode !== 'off' && (
                    <CounterText $color={hudState.currentTextColor}>{hudState.displayValue}</CounterText>
                )}
            </HUDText>
        </Container>
    );
};


export default BreathingCore;
