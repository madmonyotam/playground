import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  background-color: transparent;
  overflow: hidden;
`;

// --- Types ---

export interface RadiatingThoughtsProps {
    colors: string[];
    maxThoughts: number;
    speed: number;
    thickness: number;
    distance: number;
    opacity: number;
    tailLength: number;
    dotSize: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    path: Array<[number, number]>;
}

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 };

const RadiatingThoughtsCore = ({
    colors = ['#3b4551'],
    maxThoughts = 100,
    speed = 0.5,
    thickness = 1.0,
    distance = 300,
    opacity = 0.5,
    tailLength = 20,
    dotSize = 2.0
}: RadiatingThoughtsProps) => {
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const animationFrameRef = useRef<number | undefined>(undefined);

    const particlesRef = useRef<Particle[]>([]);
    const particleIdCounter = useRef(0);

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

    // Setup initial elements
    useEffect(() => {
        if (!drawingContext) return;
        const { selection: g } = drawingContext;

        if (g.select('.main-group').empty()) {
            const defs = g.append('defs');
            const filter = defs.append('filter')
                .attr('id', 'thought-glow')
                .attr('x', '-50%').attr('y', '-50%')
                .attr('width', '200%').attr('height', '200%');
            filter.append('feGaussianBlur')
                .attr('stdDeviation', '3')
                .attr('result', 'coloredBlur');
            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode').attr('in', 'coloredBlur');
            feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

            g.append('g').attr('class', 'main-group');
        }
    }, [drawingContext]);

    const updateAndDrawParticles = (
        mainG: d3.Selection<SVGGElement, unknown, null, undefined>,
        width: number,
        height: number,
        delta: number
    ) => {
        const center = { x: width / 2, y: height / 2 };
        const particles = particlesRef.current;

        // Dynamic emission rate based on maxThoughts
        const targetEmissionRate = (maxThoughts / 60) * speed;
        const toCreateChance = targetEmissionRate % 1;
        const toCreateBase = Math.floor(targetEmissionRate);
        const toCreate = toCreateBase + (Math.random() < toCreateChance ? 1 : 0);

        // Emission
        if (particles.length < maxThoughts && toCreate > 0) {
            for (let i = 0; i < toCreate; i++) {
                if (particles.length >= maxThoughts) break;

                const angle = Math.random() * Math.PI * 2;
                // Add some initial variance to angle to simulate 'thoughts' clustering or exploding
                const initialVelocity = speed * (0.5 + Math.random() * 1.5);

                particles.push({
                    id: particleIdCounter.current++,
                    x: 0,
                    y: 0,
                    vx: Math.cos(angle) * initialVelocity,
                    vy: Math.sin(angle) * initialVelocity,
                    life: 0,
                    maxLife: distance,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    path: [[0, 0]]
                });
            }
        }

        // Apply physical update step scaled by time delta to remain smooth
        const timeScale = Math.min(delta / 16.66, 3.0); // Cap simulation jump to prevent explosions on lag

        // Update
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Add organic randomness to the movement (curl noise effect simplified)
            p.vx += (Math.random() - 0.5) * 0.5 * speed * timeScale;
            p.vy += (Math.random() - 0.5) * 0.5 * speed * timeScale;

            // Normalize and maintain base speed pushing outward
            const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const targetSpeed = speed * 2;

            p.vx = (p.vx / currentSpeed) * targetSpeed;
            p.vy = (p.vy / currentSpeed) * targetSpeed;

            p.x += p.vx * timeScale;
            p.y += p.vy * timeScale;

            // Store path for continuous trailing line effect
            p.path.push([p.x, p.y]);
            if (p.path.length > tailLength) {
                p.path.shift(); // Keep trail reasonable
            }

            p.life += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * timeScale;

            if (p.life > p.maxLife ||
                Math.abs(p.x) > width / 2 ||
                Math.abs(p.y) > height / 2) {
                particles.splice(i, 1);
            }
        }

        const lineGenerator = d3.line<[number, number]>()
            .x(d => center.x + d[0])
            .y(d => center.y + d[1])
            .curve(d3.curveCatmullRom.alpha(0.5));

        // Draw paths instead of single points for beautiful trailing thoughts
        const particleSel = mainG.selectAll<SVGPathElement, Particle>('path.thought').data(particles, d => d.id);

        particleSel.enter().append('path')
            .attr('class', 'thought')
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            // .attr('filter', 'url(#thought-glow)') // glow can be heavy, enable based on performance or config natively maybe
            .merge(particleSel)
            .attr('stroke', d => d.color)
            .attr('stroke-width', thickness)
            .attr('stroke-opacity', d => {
                const lifeProgress = d.life / d.maxLife;
                // Fade in quickly, then fade out towards the end of max distance
                const currentOpacity = lifeProgress < 0.1
                    ? lifeProgress * 10
                    : 1 - Math.pow(lifeProgress, 2);
                return Math.max(0, currentOpacity * opacity);
            })
            .attr('d', d => lineGenerator(d.path));

        particleSel.exit().remove();

        // Draw dots at the head
        const dotSel = mainG.selectAll<SVGCircleElement, Particle>('circle.thought-head').data(particles, d => d.id);

        dotSel.enter().append('circle')
            .attr('class', 'thought-head')
            .merge(dotSel)
            .attr('cx', d => center.x + d.x)
            .attr('cy', d => center.y + d.y)
            .attr('r', dotSize)
            .attr('fill', d => d.color)
            .attr('opacity', d => {
                const lifeProgress = d.life / d.maxLife;
                const currentOpacity = lifeProgress < 0.1
                    ? lifeProgress * 10
                    : 1 - Math.pow(lifeProgress, 2);
                return Math.max(0, currentOpacity * opacity);
            });

        dotSel.exit().remove();
    };

    useEffect(() => {
        if (!drawingContext) return;

        lastFrameTimeRef.current = performance.now();
        const animate = (now: number) => {
            const delta = now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;
            timeRef.current += delta;

            const { selection: g, width, height } = drawingContext;
            const mainG = g.select<SVGGElement>('.main-group');
            if (!mainG.empty()) {
                updateAndDrawParticles(mainG, width, height, delta);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [drawingContext, maxThoughts, speed, thickness, distance, opacity, colors, tailLength, dotSize]);

    return (
        <Container>
            <BaseChart
                onReady={handleReady}
                margin={zeroMargin}
            />
        </Container>
    );
};

export default RadiatingThoughtsCore;
