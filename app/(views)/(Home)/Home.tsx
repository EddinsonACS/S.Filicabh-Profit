import React from 'react';
import { Text, View } from 'react-native';

const HomeScreen = (): JSX.Element => {
  return (
      <View className="flex-1 justify-center items-center p-4 bg-[#F9F8FD]">
        <Text className="text-2xl font-bold text-blue-600 mb-2">¡Bienvenido!</Text>
        <Text className="text-center text-gray-600">
          Gracias por usar nuestra aplicación. Estamos felices de tenerte aquí.
        </Text>
      </View>
  );
};

export default HomeScreen;