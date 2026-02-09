import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateGrave } from '../useCreateGrave';

const mockCreateGrave = jest.fn();
jest.mock('@/lib/api/graves', () => ({
  createGrave: (...args: unknown[]) => mockCreateGrave(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => jest.clearAllMocks());

describe('useCreateGrave', () => {
  it('calls createGrave and invalidates cache on success', async () => {
    const newGrave = { id: '1', slug: 'new' };
    mockCreateGrave.mockResolvedValue(newGrave);

    const { result } = renderHook(() => useCreateGrave(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        person_name: 'Test',
        slug: 'new',
        created_by: 'user-1',
        location: {},
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newGrave);
  });
});
