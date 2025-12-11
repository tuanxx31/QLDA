import { Grid } from 'antd';

const { useBreakpoint } = Grid;

interface ResponsiveWidthConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

const DEFAULT_WIDTHS: ResponsiveWidthConfig = {
  xs: 320,
  sm: 480,
  md: 640,
  lg: 720,
  xl: 720,
  xxl: 720,
};

export function useResponsiveModalWidth(customWidths?: ResponsiveWidthConfig): number {
  const screens = useBreakpoint();
  const widths = { ...DEFAULT_WIDTHS, ...customWidths };

  
  if (screens.xxl) return widths.xxl ?? widths.xl ?? widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 720;
  if (screens.xl) return widths.xl ?? widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 720;
  if (screens.lg) return widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 640;
  if (screens.md) return widths.md ?? widths.sm ?? widths.xs ?? 640;
  if (screens.sm) return widths.sm ?? widths.xs ?? 480;
  return widths.xs ?? 320;
}

