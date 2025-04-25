import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";
import AppLayout from './AppLayouts';

// Prevenir autocierre del splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Cargar fuentes
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Lato-Regular.ttf'),
  });

  // Ocultar splash screen cuando las fuentes estén cargadas
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // No mostrar nada hasta que las fuentes estén cargadas
  if (!loaded) {
    return null;
  }

  return (
    <TailwindProvider platform="native">
      <SafeAreaProvider>
        <AppLayout>
          <Stack screenOptions={{
            headerShown: false,
            animation: 'fade'
          }}>
            <Stack.Screen name="(views)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AppLayout>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </TailwindProvider>
  );
}