'use client';

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import BaseChart from '../BaseChart';

interface MeshedSphereCoreProps {
    complexity: number; // 1 to 100
    rotationInterval: number; // ms until direction change
    movementSize: number; // 0 to 10
    color: string;
    isPlaying: boolean;
}

const MeshedSphereCore = ({
    complexity = 50,
    rotationInterval = 5000,
    movementSize = 2,
    color = '#00f2ff',
    isPlaying = true
}: MeshedSphereCoreProps) => {
    const timerRef = useRef<d3.Timer | null>(null);
    const rotationRef = useRef({ x: 0, y: 0, dx: 0.2, dy: 0.1 });
    const lastDirectionChangeRef = useRef<number>(0);

    // Geometry data
    const data = useMemo(() => {
        const numPoints = Math.floor(d3.scaleLinear().domain([1, 100]).range([20, 200])(complexity));
        const points = d3.range(numPoints).map(() => {
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * 2 * Math.PI;
            return {
                phi,
                theta,
                // Static coordinates on unit sphere
                originalX: Math.sin(phi) * Math.cos(theta),
                originalY: Math.sin(phi) * Math.sin(theta),
                originalZ: Math.cos(phi),
                offset: Math.random() * Math.PI * 2 // Random phase for breathing
            };
        });

        // Connections based on complexity (distance threshold)
        const connections: [number, number][] = [];
        const threshold = d3.scaleLinear().domain([1, 100]).range([0.8, 0.4])(complexity);

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(points[i].originalX - points[j].originalX, 2) +
                    Math.pow(points[i].originalY - points[j].originalY, 2) +
                    Math.pow(points[i].originalZ - points[j].originalZ, 2)
                );
                if (dist < threshold) {
                    connections.push([i, j]);
                }
            }
        }

        return { points, connections };
    }, [complexity]);

    const onReady = useCallback((
        selection: d3.Selection<SVGGElement, unknown, null, undefined>,
        dimensions: { width: number; height: number }
    ) => {
        const { width, height } = dimensions;
        const radius = Math.min(width, height) * 0.4;
        const centerX = width / 2;
        const centerY = height / 2;

        selection.selectAll('*').remove();

        const container = selection.append('g')
            .attr('transform', `translate(${centerX}, ${centerY})`);

        // Lines group
        const linesG = container.append('g').attr('class', 'lines');
        // Points group
        const pointsG = container.append('g').attr('class', 'points');

        const projection = d3.geoOrthographic()
            .scale(radius)
            .translate([0, 0]);

        if (timerRef.current) timerRef.current.stop();

        timerRef.current = d3.timer((elapsed) => {
            if (!isPlaying) return;

            // Handle direction change
            if (elapsed - lastDirectionChangeRef.current > rotationInterval) {
                rotationRef.current.dx = (Math.random() - 0.5) * 0.5;
                rotationRef.current.dy = (Math.random() - 0.5) * 0.5;
                lastDirectionChangeRef.current = elapsed;
            }

            // Update rotation
            rotationRef.current.x += rotationRef.current.dx;
            rotationRef.current.y += rotationRef.current.dy;
            projection.rotate([rotationRef.current.x, rotationRef.current.y]);

            const breathingFactor = movementSize * 0.02;

            // Calculate point positions with breathing
            const projectedPoints = data.points.map(p => {
                const breathing = Math.sin(elapsed * 0.002 + p.offset) * breathingFactor;
                const r = 1 + breathing;
                const d = projection([
                    (p.theta * 180) / Math.PI,
                    (p.phi * 180) / Math.PI - 90
                ]);
                return {
                    x: d ? d[0] * r : 0,
                    y: d ? d[1] * r : 0,
                    visible: d ? (projection.clipAngle() ? d3.geoDistance([p.theta * 180 / Math.PI, p.phi * 180 / Math.PI - 90], [-rotationRef.current.x, -rotationRef.current.y]) < Math.PI / 2 : true) : false
                };
            });

            // Draw Lines
            const lines = linesG.selectAll<SVGLineElement, [number, number]>('line')
                .data(data.connections);

            lines.enter()
                .append('line')
                .merge(lines)
                .attr('x1', d => projectedPoints[d[0]].x)
                .attr('y1', d => projectedPoints[d[0]].y)
                .attr('x2', d => projectedPoints[d[1]].x)
                .attr('y2', d => projectedPoints[d[1]].y)
                .attr('stroke', color)
                .attr('stroke-width', 0.5)
                .attr('stroke-opacity', d => {
                    const p1 = projectedPoints[d[0]];
                    const p2 = projectedPoints[d[1]];
                    return (p1.visible && p2.visible) ? 0.4 : 0.05;
                });

            lines.exit().remove();

            // Draw Points
            const circles = pointsG.selectAll<SVGCircleElement, any>('circle')
                .data(projectedPoints);

            circles.enter()
                .append('circle')
                .attr('r', 2)
                .merge(circles)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('fill', color)
                .attr('fill-opacity', d => d.visible ? 0.8 : 0.1);

            circles.exit().remove();
        });

    }, [data, rotationInterval, movementSize, color, isPlaying]);

    useEffect(() => {
        return () => {
            if (timerRef.current) timerRef.current.stop();
        };
    }, []);

    return (
        <BaseChart onReady={onReady} />
    );
};

export default MeshedSphereCore;
