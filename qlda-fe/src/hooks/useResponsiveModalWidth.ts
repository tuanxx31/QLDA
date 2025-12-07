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

/**
 * Hook để tính width của Modal dựa trên breakpoints của Ant Design
 * @param customWidths - Tùy chọn override các giá trị width mặc định
 * @returns Width (number) tương ứng với breakpoint hiện tại
 */
export function useResponsiveModalWidth(customWidths?: ResponsiveWidthConfig): number {
  const screens = useBreakpoint();
  const widths = { ...DEFAULT_WIDTHS, ...customWidths };

  // Ưu tiên từ lớn đến nhỏ
  if (screens.xxl) return widths.xxl ?? widths.xl ?? widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 720;
  if (screens.xl) return widths.xl ?? widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 720;
  if (screens.lg) return widths.lg ?? widths.md ?? widths.sm ?? widths.xs ?? 640;
  if (screens.md) return widths.md ?? widths.sm ?? widths.xs ?? 640;
  if (screens.sm) return widths.sm ?? widths.xs ?? 480;
  return widths.xs ?? 320;
}

