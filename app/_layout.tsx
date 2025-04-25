import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";

// Prevenir autocierre del splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Lato-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TailwindProvider platform="native">
      <SafeAreaView className="flex-1 bg-[#F9F8FD]">
          <Stack>
            <Stack.Screen name="(views)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
    </TailwindProvider>
  );
}
