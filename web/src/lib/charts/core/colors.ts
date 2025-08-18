// Beautiful color palette inspired by modern design systems
export const DEFAULT_COLORS = [
  'rgba(59, 130, 246, 1)', // Blue
  'rgba(16, 185, 129, 1)', // Emerald
  'rgba(245, 158, 11, 1)', // Amber
  'rgba(147, 51, 234, 1)', // Purple
  'rgba(6, 182, 212, 1)', // Cyan
  'rgba(244, 63, 94, 1)', // Rose
  'rgba(99, 102, 241, 1)', // Indigo
  'rgba(20, 184, 166, 1)', // Teal
];

export const getColor = (index: number, colors?: string[]): string => {
  const palette = colors || DEFAULT_COLORS;
  return palette[index % palette.length];
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // If it's already rgba, extract and modify alpha
    const rgbaMatch = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbaMatch) {
      return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
    }
    return hex;
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
