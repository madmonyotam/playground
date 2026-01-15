export interface HistogramBin {
    range: string;
    percentage: number;
}

export interface DistributionChartProps {
    dataSource: Record<string, Record<string, HistogramBin[]>>;
    category: string;
    binSizeKey?: string; // e.g., '10mm', '5mm'

    // Style & Theme
    primaryColor?: string;
    theme?: 'dark' | 'light';

    // Animation
    animationSpeed?: number;

    // Axis Configuration
    xAxisLabel?: string;
    yAxisLabel?: string;
    maxXTicks?: number;

    // New Props for better control
    margin?: { top: number; right: number; bottom: number; left: number };
    gridLines?: boolean;
    barPadding?: number;
    curveType?: 'monotoneX' | 'natural' | 'linear';

    // Tooltip
    showTooltip?: boolean;
    tooltipFormatter?: (d: HistogramBin) => string;
}
