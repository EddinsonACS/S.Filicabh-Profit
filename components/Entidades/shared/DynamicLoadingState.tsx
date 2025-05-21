import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface DynamicLoadingStateProps {
  message?: string;
  color?: string;
}

const DynamicLoadingState: React.FC<DynamicLoadingStateProps> = ({
  message = 'Cargando datos...',
  color = '#581c87'
}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={color} />
      <Text className="mt-2 text-gray-600">{message}</Text>
    </View>
  );
};

export default DynamicLoadingState; 