import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

type Article = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  code: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ItemArticleProps = {
  item: Article;
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  formatPrice: (price: number) => string;
  getCategoryName: (categoryId: string) => string;
};

export default function ItemArticle({ 
  item, 
  onView, 
  onEdit, 
  onDelete, 
  formatPrice, 
  getCategoryName 
}: ItemArticleProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row">
        {/* Imagen del artículo */}
        <View className="mr-3">
          <View className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden items-center justify-center">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
            ) : (
              <Ionicons name="cube-outline" size={28} color="#9ca3af" />
            )}
          </View>
          <View className="absolute top-0 right-0 bg-blue-100 rounded-full px-1.5 py-0.5">
            <Text className="text-xs text-blue-800 font-medium">{item.stock}</Text>
          </View>
        </View>
        
        {/* Información del artículo */}
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold">{item.name}</Text>
          <Text className="text-gray-600 text-xs mt-1" numberOfLines={2}>{item.description}</Text>
          
          <View className="flex-row mt-2 items-center">
            <Text className="text-blue-800 font-bold">{formatPrice(item.price)}</Text>
            <View className="bg-gray-100 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-xs text-gray-600">{getCategoryName(item.category)}</Text>
            </View>
            <Text className="text-xs text-gray-500 ml-auto">{item.code}</Text>
          </View>
        </View>
      </View>
      
      {/* Acciones */}
      <View className="flex-row mt-3 pt-3 border-t border-gray-100 justify-end">
        <TouchableOpacity
          className="mr-4"
          onPress={() => onView(item)}
        >
          <Ionicons name="eye-outline" size={20} color="#1e40af" />
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mr-4"
          onPress={() => onEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#059669" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
