export const Colors = {
  // Backgrounds
  background: '#051424',
  backgroundSecondary: '#0F172A',
  surface: '#122131',
  surfaceLight: '#1C2B3C',
  surfaceGlass: 'rgba(255, 255, 255, 0.05)',
  surfaceGlassActive: 'rgba(99, 102, 241, 0.15)',

  // Brand Accents
  primary: '#6366F1', // Electric Indigo
  primaryLight: '#8083FF',
  primaryGlow: 'rgba(99, 102, 241, 0.4)',
  secondary: '#8B5CF6', // Vibrant Violet
  secondaryLight: '#A78BFA',

  // Status & Indicators
  online: '#10B981', // Emerald Green
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',

  // Borders & Dividers
  border: '#1E293B',
  borderLight: '#334155',
  borderFocused: '#6366F1',

  // Chat Bubbles
  sentBubble: '#6366F1',
  sentBubbleText: '#FFFFFF',
  receivedBubble: '#122131',
  receivedBubbleText: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  headlineLg: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headlineMd: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  mono: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
};
