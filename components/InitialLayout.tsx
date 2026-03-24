import { useConvexAuth } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function InitialLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Чекаємо, поки завершиться завантаження стану авторизації
    if (isLoading) return;

    const inAuthScreen = segments[0] === "(auth)";

    if (isAuthenticated && inAuthScreen) {
      router.replace("/(tabs)");
    } else if (!isAuthenticated && !inAuthScreen) {
      router.replace("/(auth)/login");
    }

    // Ховаємо сплеш-скрін тільки тоді, коли ми вже знаємо стан авторизації
    SplashScreen.hideAsync();
  }, [isAuthenticated, isLoading, segments, router]);

  // Поки йде завантаження (isLoading: true), не рендеримо нічого (сплеш-скрін ще активний)
  if (isLoading) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
