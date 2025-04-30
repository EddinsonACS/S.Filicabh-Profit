import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInUp } from 'react-native-reanimated';

type Category = {
  id: string;
  name: string;
};

type FilterProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
};

export default function Filter({
  searchQuery,
  onSearchChange,
  categories,
  currentCategory,
  onCategoryChange,
}: FilterProps) {
  return (
    <>
      {/* Buscador */}
      <View className="bg-blue-700 rounded-xl flex-row items-center p-3">
        <Ionicons name="search-outline" size={20} color="#93c5fd" />
        <TextInput
          className="flex-1 text-white ml-2"
          placeholder="Buscar artículo..."
          placeholderTextColor="#93c5fd"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle-outline" size={20} color="#93c5fd" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categorías */}
      <Animated.View
        entering={SlideInUp.duration(400).delay(100)}
        className="py-3"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`px-4 py-2 mr-2 rounded-full border ${
                currentCategory === category.id || (category.id === 'all' && !currentCategory)
                  ? 'bg-blue-800 border-blue-800'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => onCategoryChange(category.id === 'all' ? null : category.id)}
            >
              <Text
                className={
                  currentCategory === category.id || (category.id === 'all' && !currentCategory)
                    ? 'text-white'
                    : 'text-gray-700'
                }
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}
