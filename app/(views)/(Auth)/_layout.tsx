import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="MethodAuth" options={{ headerShown: false }} />
      <Stack.Screen name="ForgetPassword" options={{ headerShown: false }} />
    </Stack>
  );
}
