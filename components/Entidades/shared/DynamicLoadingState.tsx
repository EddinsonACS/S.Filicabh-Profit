import { usePathname } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { getCurrentSectionColor } from '../../../utils/colorManager';

interface DynamicLoadingStateProps {
  message?: string;
  color?: string;
}

const DynamicLoadingState: React.FC<DynamicLoadingStateProps> = ({
  message = 'Cargando datos...',
  color
}) => {
  const pathname = usePathname();
  
  // Usar el color pasado como prop o el color de la sección actual
  const activeColor = color || getCurrentSectionColor(pathname);
  
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={activeColor} />
      <Text className="mt-2 text-gray-600">{message}</Text>
    </View>
  );
};

export default DynamicLoadingState; 