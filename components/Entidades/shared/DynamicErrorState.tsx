import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DynamicErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

const DynamicErrorState: React.FC<DynamicErrorStateProps> = ({
  message = 'Ocurrió un error al cargar los datos',
  onRetry,
  retryText = 'Reintentar'
}) => {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
      <Text className="mt-2 text-gray-600 text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 bg-purple-800 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DynamicErrorState; 