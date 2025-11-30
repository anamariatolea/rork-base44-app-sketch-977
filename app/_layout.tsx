// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StreakProvider } from "@/contexts/StreakContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { PhotoStorageProvider } from "@/contexts/PhotoStorageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MoodProvider } from "@/contexts/MoodContext";
import { PartnerProvider } from "@/contexts/PartnerContext";
import { LoveBankProvider } from "@/contexts/LoveBankContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, loading, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[RootLayoutNav] Auth state:', { initialized, loading, hasUser: !!user, segments });
    
    if (!initialized) {
      console.log('[RootLayoutNav] Waiting for auth initialization...');
      return;
    }

    if (loading) {
      console.log('[RootLayoutNav] Auth is loading...');
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    console.log('[RootLayoutNav] In auth group:', inAuthGroup, 'segments:', segments);

    if (!user && !inAuthGroup) {
      console.log('[RootLayoutNav] No user, redirecting to login');
      setTimeout(() => {
        router.replace('/login' as any);
      }, 100);
    } else if (user && inAuthGroup) {
      console.log('[RootLayoutNav] User exists, redirecting to home');
      setTimeout(() => {
        router.replace('/' as any);
      }, 100);
    } else {
      console.log('[RootLayoutNav] Navigation ready, staying on current route');
    }
  }, [user, segments, initialized, loading, router]);

  if (!initialized) {
    console.log('[RootLayoutNav] Rendering null - waiting for initialization');
    return null;
  }

  console.log('[RootLayoutNav] Rendering Stack navigation');

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="goals" options={{ headerShown: true, title: "Goals & Rituals" }} />
      <Stack.Screen name="love-bank" options={{ headerShown: true, title: "Love Bank" }} />
      <Stack.Screen name="spark" options={{ headerShown: true, title: "The Spark" }} />

      <Stack.Screen name="compatibility" options={{ headerShown: true, title: "Compatibility Match" }} />
      <Stack.Screen name="vision-board" options={{ headerShown: true, title: "Vision Board" }} />
      <Stack.Screen name="games" options={{ headerShown: true, title: "Games" }} />
      <Stack.Screen name="conversations" options={{ headerShown: true, title: "Deep Conversations" }} />
      <Stack.Screen name="conflict-repair" options={{ headerShown: true, title: "Conflict Repair" }} />
      <Stack.Screen name="spark-challenges" options={{ headerShown: true, title: "Spark Challenges" }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
      <Stack.Screen name="partner-pairing" options={{ headerShown: true, title: "Partner Pairing" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <ThemeProvider>
                <PurchaseProvider>
                  <StreakProvider>
                    <PhotoStorageProvider>
                      <MoodProvider>
                        <PartnerProvider>
                          <LoveBankProvider>
                            <GestureHandlerRootView style={{ flex: 1 }}>
                              <RootLayoutNav />
                            </GestureHandlerRootView>
                          </LoveBankProvider>
                        </PartnerProvider>
                      </MoodProvider>
                    </PhotoStorageProvider>
                  </StreakProvider>
                </PurchaseProvider>
              </ThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
