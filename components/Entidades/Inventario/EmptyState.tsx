import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const EmptyState: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons name="document-outline" size={48} color="#d1d5db" />
      <Text className="mt-2 text-gray-400 text-center">No se encontraron elementos</Text>
      <Text className="text-gray-400 text-center">Intenta con otra búsqueda o agrega un nuevo elemento</Text>
    </View>
  );
};

export default EmptyState;