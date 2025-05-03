import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="Crud" options={{ headerShown: false }} />
      <Stack.Screen name="CrudInventario" options={{ headerShown: false }} />
      <Stack.Screen name="CrudFinanzas" options={{ headerShown: false }} />
      <Stack.Screen name="CrudVentas" options={{ headerShown: false }} />
    </Stack>
  );
}