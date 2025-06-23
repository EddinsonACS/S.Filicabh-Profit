import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DynamicSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddPress: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  addButtonText?: string;
  // Theme colors
  buttonColor: string;
  buttonTextColor: string;
  // Filter state for badge
  activeFiltersCount?: number;
}

const DynamicSearchBar: React.FC<DynamicSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onAddPress,
  onFilterPress,
  placeholder = 'Buscar...',
  addButtonText = 'Agregar',
  buttonColor,
  buttonTextColor,
  activeFiltersCount = 0
}) => {
  return (
    <View className="px-4 mb-2">
      <View className="flex-row items-center">
        {/* Filter Button */}
        {onFilterPress && (
          <TouchableOpacity
            style={{ 
              backgroundColor: activeFiltersCount > 0 ? buttonColor : '#f3f4f6',
              height: 44,
              width: 44,
              minHeight: 44,
              minWidth: 44,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
            className="rounded-lg mr-2"
            onPress={onFilterPress}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={activeFiltersCount > 0 ? buttonTextColor : "#6b7280"} 
            />
            {activeFiltersCount > 0 && (
              <View 
                className="absolute -top-1 -right-1 bg-red-500 rounded-full"
                style={{ minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text className="text-white text-xs font-bold">{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Search Input */}
        <View 
          className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 mr-2"
          style={{ 
            height: 44,
            minHeight: 44
          }}
        >
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ 
              height: 44,
              minHeight: 44,
              lineHeight: 20
            }}
          />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={{ 
            backgroundColor: buttonColor,
            height: 44,
            width: 44,
            minHeight: 44,
            minWidth: 44,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          className="rounded-lg"
          onPress={onAddPress}
        >
          <Ionicons name="add" size={24} color={buttonTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DynamicSearchBar; 