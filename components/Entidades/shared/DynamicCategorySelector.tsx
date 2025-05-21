import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface DynamicCategorySelectorProps<T extends string> {
  selectedCategory: T;
  setSelectedCategory: (category: T) => void;
  viewType: 'chips' | 'dropdown';
  categories: Category[];
  headerColor?: string;
  headerTextColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

const DynamicCategorySelector = <T extends string>({
  selectedCategory,
  setSelectedCategory,
  viewType,
  categories,
  headerColor = '#581c87',
  headerTextColor = '#ffffff',
  buttonColor = '#581c87',
  buttonTextColor = '#ffffff'
}: DynamicCategorySelectorProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const renderChipsView = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="py-2"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={{
              marginRight: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: selectedCategory === category.id ? `${buttonColor}20` : 'white',
              borderWidth: 1,
              borderColor: selectedCategory === category.id ? buttonColor : '#e5e7eb'
            }}
            onPress={() => setSelectedCategory(category.id as T)}
            testID={`category-chip-${category.id}`}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? buttonColor : '#6b7280'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: selectedCategory === category.id ? buttonColor : '#4b5563',
                fontWeight: selectedCategory === category.id ? '500' : 'normal'
              }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderDropdownView = () => (
    <View className="px-4 py-2">
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: `${buttonColor}40`,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        testID="category-dropdown-button"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedCategory && (
            <Ionicons
              name={categories.find(cat => cat.id === selectedCategory)?.icon || 'grid-outline'}
              size={18}
              color={buttonColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={{ color: '#1f2937' }}>
            {categories.find(cat => cat.id === selectedCategory)?.label || 'Seleccionar categoría'}
          </Text>
        </View>
        <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color={buttonColor} />
      </TouchableOpacity>

      {isDropdownOpen && (
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          style={{
            backgroundColor: 'white',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderColor: `${buttonColor}40`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
            zIndex: 10,
            marginTop: 4,
            position: 'absolute',
            left: 16,
            right: 16,
            top: 56
          }}
        >
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                  backgroundColor: selectedCategory === item.id ? `${buttonColor}10` : 'transparent'
                }}
                onPress={() => {
                  setSelectedCategory(item.id as T);
                  setIsDropdownOpen(false);
                }}
                testID={`dropdown-item-${item.id}`}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: selectedCategory === item.id ? `${buttonColor}20` : '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={selectedCategory === item.id ? buttonColor : '#6b7280'}
                  />
                </View>
                <Text
                  style={{
                    color: selectedCategory === item.id ? buttonColor : '#374151',
                    fontWeight: selectedCategory === item.id ? '500' : 'normal'
                  }}
                >
                  {item.label}
                </Text>
                {selectedCategory === item.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={buttonColor}
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );

  return viewType === 'chips' ? renderChipsView() : renderDropdownView();
};

export default DynamicCategorySelector; 