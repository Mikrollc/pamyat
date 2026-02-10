import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePublishGrave } from '../usePublishGrave';

const mockCreateGrave = jest.fn();
const mockGenerateSlug = jest.fn();
const mockUploadGravePhoto = jest.fn();
const mockUpdateGraveCoverPhoto = jest.fn();
const mockFindOrCreateCemetery = jest.fn();

jest.mock('@/lib/api', () => ({
  createGrave: (...args: unknown[]) => mockCreateGrave(...args),
  generateSlug: (...args: unknown[]) => mockGenerateSlug(...args),
  uploadGravePhoto: (...args: unknown[]) => mockUploadGravePhoto(...args),
  updateGraveCoverPhoto: (...args: unknown[]) => mockUpdateGraveCoverPhoto(...args),
  findOrCreateCemetery: (...args: unknown[]) => mockFindOrCreateCemetery(...args),
}));

jest.mock('@/lib/transliterate', () => ({
  transliterate: (text: string) => text.toLowerCase(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
  },
}));

// Mock MMKV for store import
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('usePublishGrave', () => {
  const baseParams = {
    latitude: 40.7128,
    longitude: -74.006,
    firstName: 'Ivan',
    lastName: 'Petrov',
    birthDate: { year: 1935, month: null, day: null },
    deathDate: { year: 2020, month: 5, day: 15 },
    cemeteryName: 'Green-Wood',
    cemeteryId: null,
    plotInfo: '',
    relationship: null,
    photoUri: null,
    inscription: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateSlug.mockResolvedValue('ivan-petrov-1935-2020-abc123');
    mockCreateGrave.mockResolvedValue({ id: 'grave-1', slug: 'ivan-petrov-1935-2020-abc123' });
    mockFindOrCreateCemetery.mockResolvedValue('cemetery-1');
  });

  it('creates grave without photo', async () => {
    const { result } = renderHook(() => usePublishGrave(), { wrapper: createWrapper() });

    result.current.mutate(baseParams);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGenerateSlug).toHaveBeenCalledWith('ivan petrov', 1935, 2020);
    expect(mockFindOrCreateCemetery).toHaveBeenCalledWith('Green-Wood', 40.7128, -74.006, 'user-1');
    expect(mockCreateGrave).toHaveBeenCalledWith(
      expect.objectContaining({ cemetery_id: 'cemetery-1' }),
    );
    expect(mockUploadGravePhoto).not.toHaveBeenCalled();
  });

  it('creates grave with photo upload', async () => {
    mockUploadGravePhoto.mockResolvedValue('grave-1/123.jpg');
    mockUpdateGraveCoverPhoto.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePublishGrave(), { wrapper: createWrapper() });

    result.current.mutate({ ...baseParams, photoUri: 'file:///photo.jpg' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUploadGravePhoto).toHaveBeenCalledWith('grave-1', 'file:///photo.jpg', 'user-1');
    expect(mockUpdateGraveCoverPhoto).toHaveBeenCalledWith('grave-1', 'grave-1/123.jpg');
  });

  it('skips cemetery when name is empty', async () => {
    const { result } = renderHook(() => usePublishGrave(), { wrapper: createWrapper() });

    result.current.mutate({ ...baseParams, cemeteryName: '' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFindOrCreateCemetery).not.toHaveBeenCalled();
    expect(mockCreateGrave).toHaveBeenCalledWith(
      expect.objectContaining({ cemetery_id: null }),
    );
  });

  it('passes null dates when unknown', async () => {
    const { result } = renderHook(() => usePublishGrave(), { wrapper: createWrapper() });

    result.current.mutate({
      ...baseParams,
      birthDate: { year: null, month: null, day: null },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGenerateSlug).toHaveBeenCalledWith('ivan petrov', null, 2020);
    expect(mockCreateGrave).toHaveBeenCalledWith(
      expect.objectContaining({
        birth_year: null,
        birth_month: null,
        birth_day: null,
      }),
    );
  });
});
