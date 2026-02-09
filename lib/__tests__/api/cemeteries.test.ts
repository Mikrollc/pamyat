import { fetchNearbyCemeteries } from '../../api/cemeteries';

const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

beforeEach(() => jest.clearAllMocks());

describe('fetchNearbyCemeteries', () => {
  it('calls rpc with correct params, converting km to meters', async () => {
    const cemeteries = [{ id: '1', name: 'Test Cemetery' }];
    mockRpc.mockResolvedValue({ data: cemeteries, error: null });

    const result = await fetchNearbyCemeteries(40.7, -74.0, 25);

    expect(mockRpc).toHaveBeenCalledWith('nearby_cemeteries', {
      lat: 40.7,
      lng: -74.0,
      radius_m: 25000,
    });
    expect(result).toEqual(cemeteries);
  });

  it('throws on supabase error', async () => {
    const error = { message: 'function not found' };
    mockRpc.mockResolvedValue({ data: null, error });

    await expect(fetchNearbyCemeteries(0, 0, 10)).rejects.toEqual(error);
  });
});
