import { Platform } from 'react-native';

export const colors = {
  primary: '#1a5c54',
  primaryPressed: '#14463f',
  accent: '#8B6914',
  accentPressed: '#6B510F',
  destructive: '#C04040',
  destructivePressed: '#993333',
  brand: '#1a5c54',
  textPrimary: '#000',
  textSecondary: '#555',
  textTertiary: '#767676',
  backgroundPrimary: '#fff',
  backgroundSecondary: '#f2f2f7',
  border: '#e5e5ea',
  white: '#fff',
  shadow: '#000',
  placeholderDark: '#2c3e2c',
  brandLight: '#e8f0ef',
  splash: {
    gradientStart: '#1e6b62',
    gradientMid: '#1a5c54',
    gradientMidDark: '#154a45',
    gradientEnd: '#0f3835',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 36, fontWeight: '700' as const, lineHeight: 43 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 29 },
  body: { fontSize: 17, fontWeight: '500' as const, lineHeight: 20 },
  bodySmall: { fontSize: 14, fontWeight: '500' as const, lineHeight: 17 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 14 },
  button: { fontSize: 17, fontWeight: '600' as const, lineHeight: 20 },
} as const;

export const buttonHeight = {
  md: 52,
} as const;

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
} as const;
