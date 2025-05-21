import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface DynamicEmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
}

const DynamicEmptyState: React.FC<DynamicEmptyStateProps> = ({
  icon = 'document-outline',
  title = 'No se encontraron elementos',
  subtitle = 'Intenta con otra búsqueda o agrega un nuevo elemento'
}) => {
  return (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons name={icon} size={48} color="#d1d5db" />
      <Text className="mt-2 text-gray-400 text-center">{title}</Text>
      <Text className="text-gray-400 text-center">{subtitle}</Text>
    </View>
  );
};

export default DynamicEmptyState; 