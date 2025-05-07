// components/Inventory/SearchBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';

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
    <View className="flex-row items-center px-4 py-2">
      <View className="flex-1 bg-white rounded-lg border border-gray-200 flex-row items-center px-3 py-2 mr-2 shadow-sm">
        <Ionicons name="search-outline" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-2 text-gray-800"
          placeholder="Buscar..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        className="bg-purple-700 p-2 rounded-lg shadow-sm"
        onPress={onAddPress}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;