import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from 'tailwindcss-react-native';

const HomeScreen = () => {
  return (
    <TailwindProvider platform="native">
      <SafeAreaView className="flex-1 bg-[#F9F8FD]">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-2xl font-bold text-[#1D7879] mb-2">¡Bienvenido!</Text>
          <Text className="text-center text-gray-600">
            Gracias por usar nuestra aplicación. Estamos felices de tenerte aquí.
          </Text>
        </View>
      </SafeAreaView>
    </TailwindProvider>
  );
};

export default HomeScreen;
