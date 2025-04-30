import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import ItemArticle from './ItemArticle';

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

type ListArticleProps = {
  articles: Article[];
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  formatPrice: (price: number) => string;
  getCategoryName: (categoryId: string) => string;
  onCreate: () => void;
};

export default function ListArticle({
  articles,
  onView,
  onEdit,
  onDelete,
  formatPrice,
  getCategoryName,
  onCreate,
}: ListArticleProps) {
  return (
    <View className="flex-1 px-4">
      {articles.length > 0 ? (
        <FlatList
          data={articles}
          renderItem={({ item }) => (
            <ItemArticle
              item={item}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              formatPrice={formatPrice}
              getCategoryName={getCategoryName}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-1 items-center justify-center"
        >
          <Ionicons name="search" size={48} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">
            No se encontraron artículos que coincidan con tu búsqueda
          </Text>
        </Animated.View>
      )}
      
      {/* Botón flotante para agregar */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-blue-800 items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
        onPress={onCreate}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
