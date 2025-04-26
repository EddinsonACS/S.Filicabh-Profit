import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from '../../components/AppContext';
import AppWrapper from '../../components/AppWrapper';

export default function ViewsLayout() {
  return (
    <TailwindProvider platform="native">
      <AppProvider>
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
          <AppWrapper>
            <Stack screenOptions={{ headerShown: false }} />
          </AppWrapper>
        </SafeAreaView>
      </AppProvider>
    </TailwindProvider>
  );
}