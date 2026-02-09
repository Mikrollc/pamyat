import { joinWaitlist, checkWaitlistStatus } from '../../api/waitlist';

const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockEq: jest.Mock = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: (...args: unknown[]) => mockInsert(...args),
      select: (...args: unknown[]) => mockSelect(...args),
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();

  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockEq.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
});

describe('joinWaitlist', () => {
  it('inserts and returns the waitlist entry', async () => {
    const entry = { id: '1', grave_id: 'g1' };
    mockSingle.mockResolvedValue({ data: entry, error: null });

    const result = await joinWaitlist({ grave_id: 'g1' });
    expect(result).toEqual(entry);
  });
});

describe('checkWaitlistStatus', () => {
  it('queries by grave_id and user_id with maybeSingle', async () => {
    const entry = { id: '1', grave_id: 'g1', user_id: 'u1' };
    mockMaybeSingle.mockResolvedValue({ data: entry, error: null });

    const result = await checkWaitlistStatus('g1', 'u1');
    expect(result).toEqual(entry);
  });

  it('returns null when no entry exists', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await checkWaitlistStatus('g1', 'u1');
    expect(result).toBeNull();
  });
});
