import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="Entidades" options={{ headerShown: false }} />
      <Stack.Screen name="EntInventario" options={{ headerShown: false }} />
      <Stack.Screen name="EntFinanzas" options={{ headerShown: false }} />
      <Stack.Screen name="EntVentas" options={{ headerShown: false }} />
      <Stack.Screen 
        name="ArticuloDetalle" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen 
        name="ArticuloForm" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }} 
      />
    </Stack>
  );
}