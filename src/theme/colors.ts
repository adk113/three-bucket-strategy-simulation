export const PALETTE = {
  bucket1: {
    base: '#10B981',
    dark: '#059669',
    light: '#34D399',
    bgDark: 'rgba(16, 185, 129, 0.15)',
    bgLight: 'rgba(16, 185, 129, 0.10)',
    borderDark: 'rgba(16, 185, 129, 0.35)',
    borderLight: 'rgba(16, 185, 129, 0.30)',
  },
  bucket2: {
    base: '#F59E0B',
    dark: '#D97706',
    light: '#FBBF24',
    bgDark: 'rgba(245, 158, 11, 0.15)',
    bgLight: 'rgba(245, 158, 11, 0.10)',
    borderDark: 'rgba(245, 158, 11, 0.35)',
    borderLight: 'rgba(245, 158, 11, 0.30)',
  },
  bucket3: {
    base: '#8B5CF6',
    dark: '#6D28D9',
    light: '#A78BFA',
    bgDark: 'rgba(139, 92, 246, 0.15)',
    bgLight: 'rgba(139, 92, 246, 0.10)',
    borderDark: 'rgba(139, 92, 246, 0.35)',
    borderLight: 'rgba(139, 92, 246, 0.30)',
  },
  accent: '#38BDF8',
};

export const THEME_CONFIG = {
  dark: {
    isDark: true,
    bg: '#0A0F1D',
    surface: '#131B2E',
    surfaceCard: '#182238',
    surfaceElevated: '#202D4A',
    border: '#253450',
    borderSubtle: '#1C273C',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    cardShadow: 'rgba(0, 0, 0, 0.45)',
    inputBg: '#0F1626',
    inputBorder: '#273652',
    accent: '#38BDF8',
  },
  light: {
    isDark: false,
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceCard: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    cardShadow: 'rgba(0, 0, 0, 0.06)',
    inputBg: '#F8FAFC',
    inputBorder: '#CBD5E1',
    accent: '#0284C7',
  },
};

export type ThemeType = 'dark' | 'light';
export type ThemeColors = typeof THEME_CONFIG.dark;
