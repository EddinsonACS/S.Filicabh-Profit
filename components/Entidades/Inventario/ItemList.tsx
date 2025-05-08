import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Inventario } from '@/core/models/Inventario';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ItemListProps {
  items: Inventario[];
  handleDelete: (id: number) => void;
  showItemDetails: (item: Inventario) => void;
  openEditModal: (item: Inventario) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  handleDelete,
  showItemDetails,
  openEditModal
}) => {
  return (
    <ScrollView className="flex-1 px-4 py-2 my-5" showsVerticalScrollIndicator={false}>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeIn.delay(index * 100).duration(300)}
          className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3 overflow-hidden"
        >
          <TouchableOpacity
            className="p-4"
            onPress={() => showItemDetails(item)}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-800">{item.nombre}</Text>
              <View className={`px-2 py-1 rounded-full ${item.suspendido ? 'bg-red-100' : 'bg-green-100'}`}>
                <Text className={`text-xs font-medium ${item.suspendido ? 'text-red-800' : 'text-green-800'}`}>
                  {item.suspendido ? 'Inactivo' : 'Activo'}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">
                {item.aplicaVentas ? 'Aplica Ventas' : 'No Aplica Ventas'}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.aplicaCompras ? 'Aplica Compras' : 'No Aplica Compras'}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row border-t border-gray-100">
            <TouchableOpacity
              className="flex-1 py-2 flex-row justify-center items-center"
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="create-outline" size={16} color="#4f46e5" />
              <Text className="ml-1 text-indigo-700">Editar</Text>
            </TouchableOpacity>

            <View className="w-px bg-gray-100" />

            <TouchableOpacity
              className="flex-1 py-2 flex-row justify-center items-center"
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
              <Text className="ml-1 text-red-600">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

export default ItemList;