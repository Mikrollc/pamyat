import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/api/profiles';
import { devSignIn, isDevBypassEnabled } from '@/lib/dev-auth';
import '@/i18n';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute(session: Session | null, isReady: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const checkedProfile = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicRoute = segments[0] === 'memorial';

    if (!session && !inAuthGroup && !isPublicRoute) {
      router.replace('/(auth)');
    } else if (session && inAuthGroup && segments[1] !== 'name-setup') {
      // Check if new user needs name setup (only once per session)
      if (!checkedProfile.current) {
        checkedProfile.current = true;
        fetchProfile(session.user.id)
          .then((profile) => {
            if (!profile.display_name) {
              router.replace('/(auth)/name-setup');
            } else {
              router.replace('/(tabs)/map');
            }
          })
          .catch(() => {
            // Profile fetch failed — go to map, name-setup will catch it later
            router.replace('/(tabs)/map');
          });
      }
    }
  }, [session, segments, isReady]);
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    async function initAuth() {
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
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  useProtectedRoute(session, isReady);

  useEffect(() => {
    if (isReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-grave/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="memorial/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </QueryClientProvider>
  );
}
