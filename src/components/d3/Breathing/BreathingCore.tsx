import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
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
  text-align: center;
  pointer-events: none;
  mix-blend-mode: screen;
`;

const PhaseLabel = styled.div`
  position: absolute;
  top: 15%;
  width: 100%;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  opacity: 0.6;
  color: #a0a0ff;
`;

const CounterText = styled.div`
  font-size: 4rem;
  font-weight: 200;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
`;

// Types
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
        mode: 'seconds-up' | 'seconds-down' | 'breaths' | 'off';
        currentValue?: number; // For 'breaths' mode
    };
    theme?: {
        primaryHue: number; // 0-360
    };
}

const BreathingCore = ({
    isPlaying,
    stageDurations,
    counter,
    theme = { primaryHue: 190 }
}: BreathingComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const timeRef = useRef(0); // Accumulated time in ms
    const lastFrameTimeRef = useRef(0);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Particle System Ref
    const particlesRef = useRef<Array<{
        id: number;
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        opacity: number;
    }>>([]);
    const particleIdCounter = useRef(0);

    // Internal state for HUD updates (React-driven parts)
    const [hudState, setHudState] = React.useState<{ phase: string; displayValue: string }>({
        phase: 'Inhale',
        displayValue: ''
    });

    // Configuration for the blob
    const blobConfig = useMemo(() => ({
        points: 20,
        baseRadius: 120, // Will scale relative to container
        noiseSpeed: 0.002,
        noiseAmplitude: 15
    }), []);

    // Helper to get total cycle time
    const cycleTime = useMemo(() =>
        stageDurations.inhale + stageDurations.holdFull + stageDurations.exhale + stageDurations.holdEmpty
        , [stageDurations]);

    // Setup static SVG elements (Gradients, filters)
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // Clear existing defs
        svg.select('defs').remove();
        const defs = svg.append('defs');

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

        // Ethereal Gradients
        // Core Gradient
        const coreGradient = defs.append('radialGradient')
            .attr('id', 'coreGradient');
        coreGradient.append('stop').attr('offset', '0%').attr('stop-color', `hsl(${theme.primaryHue}, 60%, 80%)`).attr('stop-opacity', 0.8);
        coreGradient.append('stop').attr('offset', '40%').attr('stop-color', `hsl(${theme.primaryHue}, 80%, 50%)`).attr('stop-opacity', 0.6);
        coreGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${theme.primaryHue + 40}, 90%, 30%)`).attr('stop-opacity', 0);



        // Particle Gradient
        const particleGradient = defs.append('radialGradient').attr('id', 'particleGradient');
        particleGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 1);
        particleGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${theme.primaryHue}, 80%, 60%)`).attr('stop-opacity', 0);

        // Outer Aura Gradient
        const auraGradient = defs.append('radialGradient')
            .attr('id', 'auraGradient');
        auraGradient.append('stop').attr('offset', '50%').attr('stop-color', `hsl(${theme.primaryHue - 20}, 50%, 40%)`).attr('stop-opacity', 0.1);
        auraGradient.append('stop').attr('offset', '100%').attr('stop-color', `hsl(${theme.primaryHue}, 50%, 10%)`).attr('stop-opacity', 0);

    }, [theme.primaryHue]);

    // Animation Loop
    useEffect(() => {
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
            // Draw one frame to ensure static state is correct after props change
            drawFrame(timeRef.current);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, stageDurations, theme]); // Depend on props so we redraw if they change while paused

    const drawFrame = (elapsed: number) => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const center = { x: width / 2, y: height / 2 };
        const svg = d3.select(svgRef.current);

        // 1. Calculate Cycle State
        const tCycle = elapsed % cycleTime;
        let stage = 'inhale';
        let stageProgress = 0; // 0-1 within the stage

        let tInStage = tCycle;

        if (tInStage < stageDurations.inhale) {
            stage = 'inhale';
            stageProgress = tInStage / stageDurations.inhale;
            // Easing: Cubic Quad
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

        // Update React HUD state throttled or just let React handle it if usage is low? 
        // For 60fps, we shouldn't setState every frame. But text updates are slow (1s).
        // Let's calc the text value here.
        let textVal = '';
        if (counter.mode === 'seconds-up') {
            textVal = Math.floor(tCycle / 1000).toString();
        } else if (counter.mode === 'seconds-down') {
            // Calculate remaining time in current stage? Or total cycle?
            // Usually it's stage based.
            let dur = 0;
            let currentT = 0;
            if (stage === 'inhale') { dur = stageDurations.inhale; currentT = tCycle; }
            else if (stage === 'holdFull') { dur = stageDurations.holdFull; currentT = tCycle - stageDurations.inhale; }
            else if (stage === 'exhale') { dur = stageDurations.exhale; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull; }
            else { dur = stageDurations.holdEmpty; currentT = tCycle - stageDurations.inhale - stageDurations.holdFull - stageDurations.exhale; }

            textVal = Math.ceil((dur - currentT) / 1000).toString();
        } else if (counter.mode === 'breaths') {
            textVal = (counter.currentValue || 0).toString();
        }

        // We use a ref or simple mutable object to compare to avoid setState spam
        // But here we'll just set it. React 18 handles batching well, but let's be safe.
        // Actually, for the HUD, let's just update the DOM directly for max perf, 
        // OR rely on the fact that these strings don't change often (once per sec/stage).
        // Let's use setState but check for changes.
        setHudState(prev => {
            const newPhase = stage === 'holdFull' ? 'Hold' : stage === 'holdEmpty' ? 'Hold' : stage.charAt(0).toUpperCase() + stage.slice(1);
            if (prev.phase !== newPhase || prev.displayValue !== textVal) {
                return { phase: newPhase, displayValue: textVal };
            }
            return prev;
        });


        // 2. The Sacred Blob Logic
        // Radius modulation
        // Base expansion: Inhale (0->1), HoldFull (1), Exhale (1->0), HoldEmpty (0)
        let expansion = 0;
        if (stage === 'inhale') expansion = stageProgress;
        else if (stage === 'holdFull') expansion = 1;
        else if (stage === 'exhale') expansion = 1 - stageProgress;
        else expansion = 0;

        const currentRadius = blobConfig.baseRadius + (expansion * 60); // 120 -> 180

        // Generate blob points driven by noise
        const points = [];
        const angleStep = (Math.PI * 2) / blobConfig.points;
        const timeVal = elapsed * blobConfig.noiseSpeed;

        for (let i = 0; i < blobConfig.points; i++) {
            const angle = i * angleStep;
            // Simple pseudo-noise using sines
            const noise = Math.sin(i * 0.5 + timeVal) * Math.cos(i * 0.3 - timeVal * 0.5) * blobConfig.noiseAmplitude;
            // Add extra pulse during "Hold"
            const microPulse = (stage === 'holdFull' || stage === 'holdEmpty') ? Math.sin(elapsed * 0.005) * 2 : 0;

            points.push([
                angle,
                currentRadius + noise + microPulse
            ]);
        }

        const lineGenerator = d3.lineRadial()
            .curve(d3.curveBasisClosed);

        // Draw the main blob
        const pathData = lineGenerator(points as [number, number][]);

        // Background layer (Aura)
        svg.select('.aura-layer').remove(); // Cheap clear
        const auraLayer = svg.selectAll('.aura-layer').data([0]);
        const auraEnter = auraLayer.enter().append('g').attr('class', 'aura-layer');

        // We can just select by ID if we create groups once.
        // Let's do that optimization: Create groups in the setup effect.
        // But for time saving, let's assume we have groups.

        // Let's use the groups created in setup
        let mainG = svg.select('g.main-group');
        if (mainG.empty()) {
            mainG = svg.append('g').attr('class', 'main-group').attr('transform', `translate(${center.x},${center.y})`);
        } else {
            mainG.attr('transform', `translate(${center.x},${center.y})`);
        }

        const blob = mainG.selectAll('path.blob').data([pathData]);
        blob.enter().append('path')
            .attr('class', 'blob')
            .attr('fill', 'url(#coreGradient)')
            .attr('filter', 'url(#glow)')
            .merge(blob as any)
            .attr('d', pathData!);

        // 3. Progress Ring
        const radius = blobConfig.baseRadius + 100;
        const arcGen = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius + 4)
            .startAngle(0)
            .cornerRadius(2);

        // Total progress or Cycle progress? 
        // Visuals show stage progress usually.
        // The prompt says "fills smoothly based on the stage's progress".
        const endAngle = stageProgress * 2 * Math.PI;

        // Background Ring
        const bgArcGen = d3.arc().innerRadius(radius).outerRadius(radius + 4).startAngle(0).endAngle(2 * Math.PI);
        const bgRing = mainG.selectAll('path.bg-ring').data([0]);
        bgRing.enter().append('path').attr('class', 'bg-ring').attr('fill', '#ffffff10')
            .merge(bgRing as any).attr('d', bgArcGen as any);

        const ring = mainG.selectAll('path.progress-ring').data([endAngle]);
        ring.enter().append('path').attr('class', 'progress-ring')
            .attr('fill', `hsl(${theme.primaryHue}, 80%, 60%)`)
            .merge(ring as any)
            .attr('d', (d) => arcGen({ endAngle: d } as any));


        // 4. Prana Particles
        const particles = particlesRef.current;
        // Emission
        if (stage === 'inhale' && Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const r = 250;
            particles.push({
                id: particleIdCounter.current++,
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                vx: 0, vy: 0,
                life: 100, maxLife: 100, opacity: 0
            });
        } else if (stage === 'exhale' && Math.random() < 0.2) {
            const angle = Math.random() * Math.PI * 2;
            const r = 50;
            particles.push({
                id: particleIdCounter.current++,
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                vx: Math.cos(angle) * 1.5,
                vy: Math.sin(angle) * 1.5,
                life: 120, maxLife: 120, opacity: 0
            });
        }

        // Update
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            if (stage === 'inhale') {
                p.x += -p.x * 0.025;
                p.y += -p.y * 0.025;
                p.life -= 1;
                p.opacity = Math.min(1, p.opacity + 0.05);
            } else if (stage === 'exhale') {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 1;
                p.opacity = p.life / p.maxLife;
            } else {
                p.x += (Math.random() - 0.5) * 0.5;
                p.y += (Math.random() - 0.5) * 0.5;
                p.life -= 0.5;
                p.opacity -= 0.005;
            }

            if (p.life <= 0 || (stage === 'inhale' && Math.sqrt(p.x * p.x + p.y * p.y) < 20)) {
                particles.splice(i, 1);
            }
        }

        // Draw Particles
        // Cast to any to avoid complex d3 selection typing issues for now
        const particleSel = mainG.selectAll('circle.particle').data(particles, (d: any) => d.id);

        particleSel.enter().append('circle')
            .attr('class', 'particle')
            .attr('r', 2)
            .attr('fill', 'url(#particleGradient)')
            .merge(particleSel as any)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('opacity', d => d.opacity);

        particleSel.exit().remove();
    };

    return (
        <Container ref={containerRef}>
            <svg ref={svgRef} width="100%" height="100%" />
            <HUDText>
                <PhaseLabel>{hudState.phase}</PhaseLabel>
                {counter.mode !== 'off' && (
                    <CounterText>{hudState.displayValue}</CounterText>
                )}
            </HUDText>
        </Container>
    );
};

export default BreathingCore;
