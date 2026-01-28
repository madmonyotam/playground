'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const PortalToPanel = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const el = document.getElementById('properties-panel-root');
    if (!el) return null;

    return createPortal(children, el);
};
