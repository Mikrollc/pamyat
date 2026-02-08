import { supabase } from '@/lib/supabase';

const DEV_EMAIL = 'dev@pamyat.local';
const DEV_PASSWORD = 'devpassword123';

/**
 * Signs in with a seeded dev user for local development.
 * Only callable when EXPO_PUBLIC_DEV_AUTH_BYPASS is 'true'.
 * Returns the session or throws if bypass is not enabled.
 */
export async function devSignIn() {
  if (process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS !== 'true') {
    throw new Error('Dev auth bypass is not enabled');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });

  if (error) {
    throw new Error(
      `Dev auth failed: ${error.message}. ` +
      'Make sure Supabase is running locally and the dev seed has been applied.'
    );
  }

  return data.session;
}

export function isDevBypassEnabled(): boolean {
  return process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === 'true';
}
