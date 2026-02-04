import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import BaseChart from '../BaseChart';

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #1a1e2e 0%, #000000 100%);
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
  mix-blend-mode: screen;
  gap: 1rem;
`;

const PhaseLabel = styled.div<{ $textColor?: string; $hue: number }>`
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  opacity: 0.9;
  color: ${({ $textColor, $hue }) => $textColor || `hsl(${$hue}, 100%, 80%)`};
  text-shadow: 0 0 10px ${({ $hue }) => `hsl(${$hue}, 80%, 40%)`};
  transition: color 0.3s ease, text-shadow 0.3s ease;
`;

const CounterText = styled.div<{ $textColor?: string; $hue: number }>`
  font-size: 4rem;
  font-weight: 200;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: ${({ $textColor, $hue }) => $textColor || `hsl(${$hue}, 100%, 80%)`};
  text-shadow: 0 0 15px ${({ $hue }) => `hsl(${$hue}, 80%, 40%)`};
  transition: color 0.3s ease, text-shadow 0.3s ease;
`;
//...


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
        currentValue?: number; // Kept for backward compat if needed, but we calculate internally now
    };
    theme?: {
        primaryHue: number; // 0-360
        textColor?: string;
    };
    particleConfig?: {
        size?: number;
        lifetime?: number;
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
        // Count down seconds in current stage (like "now")
        let dur = 0;
        let currentT = 0;
        if (stage === 'inhale') { dur = stageDurations.inhale; currentT = tCycle; }
        else if (stage === 'holdFull') { dur = stageDurations.holdFull; currentT = tCycle - stageDurations.inhale; }
        else if (stage === 'exhale') { dur = stageDurations.exhale; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull; }
        else { dur = stageDurations.holdEmpty; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull - stageDurations.exhale; }

        return Math.ceil((dur - currentT) / 1000).toString();
    } else if (mode === 'breaths') {
        const cycleTime = stageDurations.inhale + stageDurations.holdFull + stageDurations.exhale + stageDurations.holdEmpty;
        // Count completed cycles. "return to start is one count"
        // Starting at 0? User said "return to start is ONE count". If it starts at 0, then after one cycle it's 1.
        return Math.floor(elapsed / cycleTime).toString();
    }
    return '';
};

const setupDefs = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    if (g.select('defs').empty()) {
        const defs = g.append('defs');

        // Glow Filter
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

        // Placeholders for gradients
        defs.append('radialGradient').attr('id', 'coreGradient');
        defs.append('radialGradient').attr('id', 'particleGradient');
        defs.append('radialGradient').attr('id', 'auraGradient');
    }
};

const updateGradients = (g: d3.Selection<SVGGElement, unknown, null, undefined>, hue: number) => {
    const defs = g.select('defs');
    if (defs.empty()) return;

    // Core Gradient
    const coreGradient = defs.select('#coreGradient');
    coreGradient.html('');
    coreGradient.append('stop').attr('offset', '0%').attr('stop-color', `hsl(${hue}, 60%, 80%)`).attr('stop-opacity', 0.8);
    coreGradient.append('stop').attr('offset', '40%').attr('stop-color', `hsl(${hue}, 80%, 50%)`).attr('stop-opacity', 0.6);
    coreGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${hue + 40}, 90%, 30%)`).attr('stop-opacity', 0);

    // Particle Gradient
    const particleGradient = defs.select('#particleGradient');
    particleGradient.html('');
    particleGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 1);
    particleGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${hue}, 80%, 60%)`).attr('stop-opacity', 0);

    // Aura Gradient
    const auraGradient = defs.select('#auraGradient');
    auraGradient.html('');
    auraGradient.append('stop').attr('offset', '50%').attr('stop-color', `hsl(${hue - 20}, 50%, 40%)`).attr('stop-opacity', 0.1);
    auraGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${hue}, 50%, 10%)`).attr('stop-opacity', 0);
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
    mainG: d3.Selection<any, any, any, any>, // mainG returned from drawBlob
    radius: number,
    themeHue: number,
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
        .attr('fill', `hsl(${themeHue}, 80%, 60%)`)
        .attr('d', (d) => arcGen({ endAngle: d } as any));
};

const updateAndDrawParticles = (
    mainG: d3.Selection<any, any, any, any>,
    particles: Array<any>,
    particleIdCounter: React.MutableRefObject<number>,
    stage: string,
    minDim: number,
    particleConfig: { size: number, lifetime: number }
) => {
    const particleCreationDist = minDim * 0.5;
    const particleEndDist = minDim * 0.1;
    const pLifetime = particleConfig.lifetime;
    const pSize = particleConfig.size;

    // Emission
    if (stage === 'inhale' && Math.random() < 0.8) {
        const angle = Math.random() * Math.PI * 2;
        // Start further out (0.55 to 0.65 of minDim) to avoid "appearing too internal"
        const r = minDim * (0.55 + Math.random() * 0.1);
        particles.push({
            id: particleIdCounter.current++,
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
            vx: 0, vy: 0,
            life: pLifetime, maxLife: pLifetime, opacity: 0
        });
    } else if (stage === 'exhale' && Math.random() < 0.6) {
        const angle = Math.random() * Math.PI * 2;
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

    // Update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        let dx = 0;
        let dy = 0;

        if (stage === 'inhale') {
            // Calculate velocity based on position for Inhale
            dx = -p.x * 0.02;
            dy = -p.y * 0.02;
            p.x += dx;
            p.y += dy;
            p.life -= 0.5;
            p.opacity = Math.min(1, p.opacity + 0.02);
        } else if (stage === 'exhale') {
            dx = p.vx;
            dy = p.vy;
            p.x += dx;
            p.y += dy;
            p.life -= 1;
            p.opacity = p.life / p.maxLife;
        } else {
            dx = (Math.random() - 0.5) * 0.5;
            dy = (Math.random() - 0.5) * 0.5;
            p.x += dx;
            p.y += dy;
            p.life -= 0.5;
            p.opacity -= 0.005;
        }

        // Store velocity for drawing trails
        p.currentVx = dx;
        p.currentVy = dy;

        // Check boundaries
        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        const maxDist = minDim * 0.65; // Extended boundary for new spawn particles

        if (p.life <= 0 || (stage === 'inhale' && dist < 20) || dist > maxDist) {
            particles.splice(i, 1);
        }
    }

    // Draw
    const particleSel = mainG.selectAll('line.particle').data(particles, (d: any) => d.id);

    particleSel.enter().append('line')
        .attr('class', 'particle')
        .attr('stroke', 'url(#particleGradient)') // Use stroke for line
        .attr('stroke-linecap', 'round')
        .merge(particleSel as any)
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.x - d.currentVx * 3) // Trail length factor
        .attr('y2', d => d.y - d.currentVy * 3)
        .attr('stroke-opacity', d => d.opacity)
        .attr('stroke-width', pSize * 2); // Width based on size (diameter)

    particleSel.exit().remove();
};


// --- Component ---

const BreathingCore = ({
    isPlaying,
    stageDurations,
    counter,
    theme = { primaryHue: 190 },
    particleConfig = { size: 2, lifetime: 100 }
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

    const [hudState, setHudState] = React.useState<{ phase: string; displayValue: string }>({
        phase: 'Inhale',
        displayValue: ''
    });

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

    // Update Gradients
    useEffect(() => {
        if (!drawingContext) return;
        const { selection: g } = drawingContext;
        updateGradients(g, theme.primaryHue);
    }, [drawingContext, theme.primaryHue]);

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
    }, [isPlaying, stageDurations, theme, drawingContext]);

    const drawFrame = (elapsed: number) => {
        if (!drawingContext) return;
        const { selection: g, width, height } = drawingContext;
        const center = { x: width / 2, y: height / 2 };

        const minDim = Math.min(width, height);
        const blobBaseRadius = minDim * 0.25;
        const blobMaxGrowth = minDim * 0.15;
        const ringRadius = minDim * 0.42;

        // 1. Cycle State
        const { stage, stageProgress, tCycle } = calculateCycleState(elapsed, cycleTime, stageDurations);

        // 2. HUD
        const textVal = getDisplayText(counter.mode, tCycle, elapsed, stage, stageDurations, counter.currentValue);

        setHudState(prev => {
            const newPhase = stage === 'holdFull' ? 'Hold' : stage === 'holdEmpty' ? 'Hold' : stage.charAt(0).toUpperCase() + stage.slice(1);
            if (prev.phase !== newPhase || prev.displayValue !== textVal) {
                return { phase: newPhase, displayValue: textVal };
            }
            return prev;
        });

        // 3. Draw Blob
        const mainG = drawBlob(g, center, elapsed, stage, stageProgress, blobBaseRadius, blobMaxGrowth, blobConfig);

        // 4. Draw Ring
        drawProgressRing(mainG, ringRadius, theme.primaryHue, stageProgress);

        // 5. Draw Particles
        // Ensure particleConfig has valid accessors or fallback in the function
        const safeParticleConfig = {
            size: particleConfig.size || 2,
            lifetime: particleConfig.lifetime || 100
        };
        updateAndDrawParticles(mainG, particlesRef.current, particleIdCounter, stage, minDim, safeParticleConfig);
    };

    return (
        <Container>
            <BaseChart
                onReady={handleReady}
                margin={zeroMargin}
            />
            <HUDText>
                <PhaseLabel $textColor={theme.textColor} $hue={theme.primaryHue}>{hudState.phase}</PhaseLabel>
                {counter.mode !== 'off' && (
                    <CounterText $textColor={theme.textColor} $hue={theme.primaryHue}>{hudState.displayValue}</CounterText>
                )}
            </HUDText>
        </Container>
    );
};

export default BreathingCore;
