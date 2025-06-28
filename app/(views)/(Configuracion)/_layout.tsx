import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-[#F9F8FD]">
      <Stack>
        <Stack.Screen name="Configuracion" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}