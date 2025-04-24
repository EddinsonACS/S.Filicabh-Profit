import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="Home" options={{ headerShown: false }} />
    </Stack>
  );
}