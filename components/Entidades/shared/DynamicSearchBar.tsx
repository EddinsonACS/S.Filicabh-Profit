import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface DynamicSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddPress: () => void;
  placeholder?: string;
  addButtonText?: string;
  // Theme colors
  buttonColor: string;
  buttonTextColor: string;
}

const DynamicSearchBar: React.FC<DynamicSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onAddPress,
  placeholder = 'Buscar...',
  addButtonText = 'Agregar',
  buttonColor,
  buttonTextColor
}) => {
  return (
    <View className="px-4 mb-2">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 mr-2">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={{ backgroundColor: buttonColor }}
          className="p-2 rounded-lg flex-row items-center"
          onPress={onAddPress}
        >
          <Ionicons name="add" size={24} color={buttonTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DynamicSearchBar; 