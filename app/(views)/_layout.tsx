import { Stack, router } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from '../../components/InitStage/AppContext';
import AppWrapper from '../../components/InitStage/AppWrapper';
import { useInventory } from "@/hooks/Inventario/useInventory";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ViewsLayout() {
  const { useGetInventoryList } = useInventory();
  const { isError, isSuccess, isLoading } = useGetInventoryList();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      if (hasCheckedSession.current) return;
      
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.replace("/Splash");
      } else if (isSuccess) {
        router.replace("/Entrepise");
      } else if (isError) {
        router.replace("/Splash");
      }
      hasCheckedSession.current = true;
    };

    if (!isLoading) {
      checkSession();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

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
