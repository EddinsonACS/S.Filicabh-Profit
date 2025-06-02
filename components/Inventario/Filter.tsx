import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  sectionColor?: string;
};

export default function Filter({
  searchQuery,
  onSearchChange,
  categories,
  currentCategory,
  onCategoryChange,
  sectionColor = '#7c3aed', // Color por defecto de inventario
}: FilterProps) {
  
  // Color más oscuro para el fondo del buscador
  const darkerColor = `${sectionColor}CC`;
  
  return (
    <>
      {/* Buscador */}
      <View 
        className="rounded-xl flex-row items-center p-3"
        style={{ backgroundColor: darkerColor }}
      >
        <Ionicons name="search-outline" size={20} color="#ffffff" />
        <TextInput
          className="flex-1 text-white ml-2"
          placeholder="Buscar artículo..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
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
          {categories.map((category) => {
            const isActive = currentCategory === category.id || (category.id === 'all' && !currentCategory);
            return (
              <TouchableOpacity
                key={category.id}
                className={`px-4 py-2 mr-2 rounded-full border`}
                style={{
                  backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                  borderColor: sectionColor,
                }}
                onPress={() => onCategoryChange(category.id === 'all' ? null : category.id)}
              >
                <Text
                  style={{
                    color: isActive ? sectionColor : 'white',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}
