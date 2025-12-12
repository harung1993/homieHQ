// PropertyPal Mobile App Theme
// Based on mockup design specifications

export const colors = {
  // Primary Brand Colors
  primary: '#38bdf8',        // Sky Blue (main brand)
  secondary: '#3b82f6',      // Blue

  // Background Colors
  background: '#0f172a',     // Dark background
  cardBg: '#1e293b',         // Card background
  cardBorder: '#334155',     // Border color

  // Text Colors
  textPrimary: '#ffffff',    // White text
  textSecondary: '#94a3b8',  // Gray text
  textMuted: '#64748b',      // Muted gray

  // Status Colors
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Orange
  error: '#ef4444',          // Red
  urgent: '#ef4444',         // Red for urgent

  // Badge Colors
  badgeHigh: '#38bdf8',      // Sky blue
  badgeMedium: '#f59e0b',    // Orange
  badgeLow: '#10b981',       // Green
  badgeUrgent: '#ef4444',    // Red

  // Gradient Colors
  gradientStart: '#38bdf8',
  gradientEnd: '#3b82f6',
  gradientGreenStart: '#10b981',
  gradientGreenEnd: '#059669',
  gradientRedStart: '#ef4444',
  gradientRedEnd: '#dc2626',
  gradientPurpleStart: '#8b5cf6',
  gradientPurpleEnd: '#7c3aed',
};

export const typography = {
  // Font Sizes
  sizes: {
    tiny: 11,
    small: 12,
    body: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 28,
    huge: 36,
  },

  // Font Weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 30,
  full: 999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};
