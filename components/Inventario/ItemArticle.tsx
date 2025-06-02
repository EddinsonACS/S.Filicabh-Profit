import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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

interface ItemArticleProps {
  item: Article;
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  formatPrice: (price: number) => string;
  getCategoryName: (categoryId: string) => string;
}

const ItemArticle: React.FC<ItemArticleProps> = ({ 
  item, 
  onView, 
  onEdit, 
  onDelete, 
  formatPrice, 
  getCategoryName 
}) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onView(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          
          {/* Descripción */}
          <View className="mb-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          
          {/* Fila final - Información del producto y Stock en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            {/* Información del producto a la izquierda */}
            <View className="flex-1 mr-2">
              <Text className="text-sm text-gray-600">
                {formatPrice(item.price)} • {getCategoryName(item.category)}
              </Text>
              <Text className="text-xs text-gray-500">
                Código: {item.code}
              </Text>
            </View>

            {/* Stock a la derecha */}
            <View className={`px-2 py-1 rounded-full ${item.stock > 10
              ? 'bg-green-100 border border-green-600'
              : item.stock > 0
              ? 'bg-yellow-100 border border-yellow-600'
              : 'bg-red-100 border border-red-600'
              }`}>
              <Text className={`text-xs font-medium ${item.stock > 10
                ? 'text-green-600'
                : item.stock > 0
                ? 'text-yellow-600'
                : 'text-red-600'
                }`}>
                Stock: {item.stock}
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="flex-row justify-end space-x-2 mt-2">
            <TouchableOpacity
              onPress={() => onEdit(item)}
              className="bg-blue-500 px-3 py-1 rounded-lg"
            >
              <Ionicons name="create-outline" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item)}
              className="bg-red-500 px-3 py-1 rounded-lg"
            >
              <Ionicons name="trash-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-gray-400 mt-2">
            Creado: {item.createdAt.toLocaleDateString()} • Actualizado: {item.updatedAt.toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ItemArticle;
