// src/app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * This component handles the core navigation logic. It waits for the authentication
 * state to be initialized and then redirects the user to the appropriate screen.
 */
function RootLayoutNav() {
  const { session, initializing } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until the auth state is no longer initializing.
    if (initializing) {
      return;
    }

    // `useSegments()` returns an array of path segments. Check whether the
    // current route is inside the `(tabs)` group by inspecting the first
    // segment (or checking inclusion) instead of comparing to a string.
  // Normalize segments to a plain string[] for safer checks.
  const segs: string[] = Array.isArray(segments) ? (segments as unknown as string[]) : [];
  const inTabsGroup = segs.length > 0 && segs[0] === '(tabs)';

  // Determine if the current route is one of the auth screens where we
  // should redirect signed-in users away (e.g., 'login' or 'signup'). We do
  // NOT want to redirect users away from other non-tab routes like the
  // 'add-complaint' modal.
  const onAuthScreen = segs.includes('login') || segs.includes('signup');

    // If the user is signed in and is currently on an auth screen, send them to home.
    if (session && onAuthScreen) {
      router.replace('/(tabs)/home');
    }

    // If the user is not signed in and is trying to access the tabs group,
    // redirect them to the login screen.
    if (!session && inTabsGroup) {
      router.replace('/login');
    }
    // NOTE: We want to re-evaluate when `segments` changes so the redirect logic
    // has the correct context about whether the user is currently inside the
    // tabs group. Including `segments` here won't cause unwanted redirects
    // because the logic checks the current `session` and `inTabsGroup` values.
  }, [session, initializing, segments]);

  // While the authentication state is initializing, show a loading spinner.
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  // Once initialization is complete, render the main Stack navigator.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="add-complaint" 
        options={{ 
          presentation: 'modal', 
          title: 'Report a New Problem', 
          headerShown: true 
        }} 
      />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

// The main export wraps the entire app in the AuthProvider.
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
