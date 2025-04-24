import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Splash" options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="Entrepise" options={{ headerShown: false }} />
      <Stack.Screen name="(Home)" options={{ headerShown: false }} />
      <Stack.Screen name="(Auth)" options={{ headerShown: false }} />
    </Stack>
  );
}