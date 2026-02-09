import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { devSignIn, isDevBypassEnabled } from '@/lib/dev-auth';
import '@/i18n';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute(session: Session | null, isReady: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/map');
    }
  }, [session, segments, isReady]);
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // If dev bypass is enabled, auto-sign in with seeded dev user
      if (isDevBypassEnabled()) {
        try {
          const devSession = await devSignIn();
          setSession(devSession);
        } catch (e) {
          console.warn('Dev auth bypass failed:', e);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      }

      setIsReady(true);
      SplashScreen.hideAsync();
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  useProtectedRoute(session, isReady);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-grave" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </QueryClientProvider>
  );
}
