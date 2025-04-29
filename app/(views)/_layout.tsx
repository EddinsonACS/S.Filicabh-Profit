import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from '../../components/AppContext';
import AppWrapper from '../../components/AppWrapper';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../utils/libs/queryClient';

export default function ViewsLayout() {
  return (
    <TailwindProvider platform="native">
      <QueryClientProvider client={queryClient}>
      <AppProvider>
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
          <AppWrapper>
            <Stack screenOptions={{ headerShown: false }} />
          </AppWrapper>
        </SafeAreaView>
      </AppProvider>
      </QueryClientProvider>
    </TailwindProvider>
  );
}
