import { render, screen } from '@testing-library/react-native';
import LicensesScreen from '../licenses';

describe('LicensesScreen', () => {
  it('renders all library names', () => {
    render(<LicensesScreen />);

    const expectedLibraries = [
      'libphonenumber-js',
      'expo',
      'expo-router',
      'react',
      'react-native',
      'i18next',
      'react-i18next',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'zustand',
      '@rnmapbox/maps',
      'react-native-reanimated',
      'react-native-mmkv',
      'react-native-svg',
      'react-native-screens',
      'react-native-safe-area-context',
      '@react-navigation/native',
      '@react-native-async-storage/async-storage',
      '@expo/vector-icons',
    ];

    for (const lib of expectedLibraries) {
      expect(screen.getByText(lib)).toBeTruthy();
    }
  });

  it('renders MIT license text', () => {
    render(<LicensesScreen />);
    expect(screen.getByText('MIT License')).toBeTruthy();
    expect(screen.getByText(/Permission is hereby granted/)).toBeTruthy();
  });

  it('renders author and license info for each library', () => {
    render(<LicensesScreen />);
    expect(screen.getByText('MIT — catamphetamine')).toBeTruthy();
    expect(screen.getAllByText('MIT — Meta Platforms, Inc.').length).toBe(2);
    expect(screen.getByText('MIT — Supabase')).toBeTruthy();
  });
});
