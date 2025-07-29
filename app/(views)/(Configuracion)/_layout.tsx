import { Stack } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Stack>
        <Stack.Screen 
          name="Configuracion" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }} 
        />
      </Stack>
    </View>
  );
}