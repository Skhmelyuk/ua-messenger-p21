import { useEffect } from "react";
import { useAuth } from "@clerk/expo";
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter, useSegments } from "expo-router";

export default function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";

    // Якщо користувач залогінений — забороняємо тільки auth-екрани.
    // Інші роути (наприклад /user/[id]) мають відкриватися без редіректу.
    if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthScreen) {
      // Якщо НЕ залогінений — дозволяємо тільки auth-екрани.
      router.replace("/(auth)/login");
    }

    // Ховаємо splash тільки після редіректу
    SplashScreen.hideAsync();
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
