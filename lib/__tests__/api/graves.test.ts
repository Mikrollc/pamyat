import { fetchGrave, fetchGravesByUser, createGrave, updateGrave } from '../../api/graves';

const mockSingle = jest.fn();
const mockIs = jest.fn();
const mockEq: jest.Mock = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: (...args: unknown[]) => mockSelect(...args),
      insert: (...args: unknown[]) => mockInsert(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();

  // Default chain: .select().eq().is().single()
  mockSingle.mockResolvedValue({ data: null, error: null });
  mockIs.mockReturnValue({ single: mockSingle });
  mockEq.mockReturnValue({ eq: mockEq, is: mockIs, single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
  mockUpdate.mockReturnValue({ eq: () => ({ select: () => ({ single: mockSingle }) }) });
});

describe('fetchGrave', () => {
  it('returns grave data on success', async () => {
    const grave = { id: '1', slug: 'test', cemetery: { id: 'c1' } };
    mockSingle.mockResolvedValue({ data: grave, error: null });

    const result = await fetchGrave('test');
    expect(result).toEqual(grave);
  });

  it('throws on supabase error', async () => {
    const error = { message: 'not found', code: 'PGRST116' };
    mockSingle.mockResolvedValue({ data: null, error });

    await expect(fetchGrave('missing')).rejects.toEqual(error);
  });
});

describe('fetchGravesByUser', () => {
  it('filters out soft-deleted graves and nulls', async () => {
    const rows = [
      { grave: { id: '1', deleted_at: null } },
      { grave: { id: '2', deleted_at: '2026-01-01' } },
      { grave: null },
    ];
    mockEq.mockResolvedValueOnce({ data: rows, error: null });

    const result = await fetchGravesByUser('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('throws on supabase error', async () => {
    const error = { message: 'unauthorized' };
    mockEq.mockResolvedValueOnce({ data: null, error });

    await expect(fetchGravesByUser('user-1')).rejects.toEqual(error);
  });
});

describe('createGrave', () => {
  it('inserts and returns the new grave', async () => {
    const newGrave = { id: '1', slug: 'new' };
    mockSingle.mockResolvedValue({ data: newGrave, error: null });

    const result = await createGrave({
      person_name: 'Test',
      slug: 'new',
      created_by: 'user-1',
      location: {},
    });

    expect(result).toEqual(newGrave);
  });
});

describe('updateGrave', () => {
  it('updates and returns the grave', async () => {
    const updated = { id: '1', person_name: 'Updated' };
    mockSingle.mockResolvedValue({ data: updated, error: null });

    const result = await updateGrave('1', { person_name: 'Updated' });
    expect(result).toEqual(updated);
  });
});
