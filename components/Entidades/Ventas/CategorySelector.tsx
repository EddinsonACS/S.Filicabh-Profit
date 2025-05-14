import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { salesCategories } from './EntVentasData';

interface CategorySelectorProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    viewType: 'chips' | 'dropdown';
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    selectedCategory,
    setSelectedCategory,
    viewType
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Render chips view (horizontal scrolling buttons)
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
                {salesCategories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        className={`mr-3 px-4 py-2 rounded-lg flex-row items-center ${selectedCategory === category.type
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}
                        onPress={() => setSelectedCategory(category.type)}
                    >
                        <Ionicons
                            name={category.icon as any}
                            size={16}
                            color={selectedCategory === category.type ? '#15803d' : '#6b7280'}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            className={selectedCategory === category.type ? 'text-green-900 font-medium' : 'text-gray-600'}
                        >
                            {category.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );

    // Render dropdown view
    const renderDropdownView = () => (
        <View className="px-4 py-2">
            <TouchableOpacity
                className="bg-white rounded-lg border border-green-200 shadow-sm p-3 flex-row justify-between items-center"
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <View className="flex-row items-center">
                    {selectedCategory && (
                        <Ionicons
                            name={salesCategories.find(cat => cat.type === selectedCategory)?.icon as any || 'grid-outline'}
                            size={18}
                            color="#15803d"
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text className="text-gray-800">
                        {salesCategories.find(cat => cat.type === selectedCategory)?.title || 'Seleccionar categoría'}
                    </Text>
                </View>
                <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#15803d" />
            </TouchableOpacity>

            {/* Dropdown menu (in-place, not modal) */}
            {isDropdownOpen && (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(300)}
                    className="bg-white rounded-b-lg border-x border-b border-green-200 shadow-lg z-10 mt-1 absolute left-4 right-4 top-[56px]"
                >
                    <FlatList
                        data={salesCategories}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        style={{ maxHeight: 300 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`flex-row items-center p-3 border-b border-gray-100 ${selectedCategory === item.type ? 'bg-green-50' : ''
                                    }`}
                                onPress={() => {
                                    setSelectedCategory(item.type);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <View className={`w-8 h-8 rounded-full ${selectedCategory === item.type ? 'bg-green-100' : 'bg-gray-100'
                                    } items-center justify-center mr-2`}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={16}
                                        color={selectedCategory === item.type ? '#15803d' : '#6b7280'}
                                    />
                                </View>
                                <Text className={selectedCategory === item.type ? 'text-green-900 font-medium' : 'text-gray-700'}>
                                    {item.title}
                                </Text>
                                {selectedCategory === item.type && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#15803d"
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

export default CategorySelector;