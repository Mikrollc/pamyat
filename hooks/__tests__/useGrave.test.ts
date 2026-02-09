import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGrave } from '../useGrave';

const mockFetchGrave = jest.fn();
jest.mock('@/lib/api/graves', () => ({
  fetchGrave: (...args: unknown[]) => mockFetchGrave(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => jest.clearAllMocks());

describe('useGrave', () => {
  it('fetches grave by slug', async () => {
    const grave = { id: '1', slug: 'test-grave' };
    mockFetchGrave.mockResolvedValue(grave);

    const { result } = renderHook(() => useGrave('test-grave'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(grave);
    expect(mockFetchGrave).toHaveBeenCalledWith('test-grave');
  });

  it('does not fetch when slug is empty', () => {
    const { result } = renderHook(() => useGrave(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetchGrave).not.toHaveBeenCalled();
  });
});
