import React from 'react';
import SpectrogramExample from '@/components/d3/SpectrogramExample';

export default function SpectrogramPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', height: '100%' }}>
            <header>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Spectrogram Simulation</h1>
                <p style={{ color: '#888', marginTop: '0.5rem' }}>
                    Real-time RF spectrogram visualization using Canvas.
                </p>
            </header>
            <SpectrogramExample />
        </div>
    );
}
