const mockSignIn = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
    },
  },
}));

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  mockSignIn.mockClear();
});

afterAll(() => {
  process.env = originalEnv;
});

function loadModule() {
  return require('../dev-auth') as typeof import('../dev-auth');
}

describe('isDevBypassEnabled', () => {
  it('returns true when EXPO_PUBLIC_DEV_AUTH_BYPASS is "true"', () => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    const { isDevBypassEnabled } = loadModule();
    expect(isDevBypassEnabled()).toBe(true);
  });

  it('returns false when EXPO_PUBLIC_DEV_AUTH_BYPASS is not set', () => {
    delete process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
    const { isDevBypassEnabled } = loadModule();
    expect(isDevBypassEnabled()).toBe(false);
  });

  it('returns false when EXPO_PUBLIC_DEV_AUTH_BYPASS is "false"', () => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'false';
    const { isDevBypassEnabled } = loadModule();
    expect(isDevBypassEnabled()).toBe(false);
  });
});

describe('devSignIn', () => {
  it('throws when bypass is not enabled', async () => {
    delete process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
    const { devSignIn } = loadModule();
    await expect(devSignIn()).rejects.toThrow('Dev auth bypass is not enabled');
  });

  it('calls supabase signInWithPassword with dev credentials', async () => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    const mockSession = { access_token: 'test-token', user: { id: '123' } };
    mockSignIn.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { devSignIn } = loadModule();
    const session = await devSignIn();

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'dev@pamyat.local',
      password: 'devpassword123',
    });
    expect(session).toBe(mockSession);
  });

  it('throws with helpful message when supabase returns error', async () => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    mockSignIn.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { devSignIn } = loadModule();
    await expect(devSignIn()).rejects.toThrow('Dev auth failed: Invalid login credentials');
  });
});
