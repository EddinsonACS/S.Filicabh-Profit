// components/Inventory/SearchBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onAddPress
}) => {
  return (
    <View className="px-4 py-2 bg-white border-b border-gray-200">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mr-2">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Buscar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          className="bg-purple-600 p-2 rounded-lg flex-row items-center"
          onPress={onAddPress}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;