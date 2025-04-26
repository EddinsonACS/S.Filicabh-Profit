import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-[#F9F8FD]">
      <Stack>
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="ForgetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="MethodAuth" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}