import { Inventario } from '@/core/models/Inventario';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import EmptyState from './EmptyState';

interface ItemsListProps {
  items: Inventario[];
  handleDelete: (id: number) => void;
  showItemDetails: (item: Inventario) => void;
  openEditModal: (item: Inventario) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  showItemDetails,
  onLoadMore,
  hasMore
}) => {
  const ItemComponent = ({ item }: { item: Inventario }) => (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => showItemDetails(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row space-x-2">
              {/* Ventas */}
              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaVentas ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">
                  Ventas
                </Text>
              </View>

              {/* Compras */}
              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaCompras ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">
                  Compras
                </Text>
              </View>
            </View>

            {/* Estado */}
            <View className={`px-2 py-1 rounded-full ${item.suspendido
              ? 'bg-red-100 border border-red-600'
              : 'bg-green-100 border border-green-600'
              }`}>
              <Text className={`text-xs font-medium ${item.suspendido
                ? 'text-red-600'
                : 'text-green-600'
                }`}>
                {item.suspendido ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
          </View>

          {/* Información adicional */}
          <Text className="text-xs text-gray-400 mt-2">
            ID: {item.id} · Creado: {new Date(item.fechaRegistro).toLocaleDateString()}
          </Text>
          <Text className="text-xs text-gray-400">
            Creado por: {item.usuarioRegistroNombre}
          </Text>
          <Text className="text-xs text-gray-400">
            Ultima modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#581c87" />
      </View>
    );
  };

  return (
    <FlatList
      data={items}
      ListEmptyComponent={<EmptyState />}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ItemComponent item={item} />
      )}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
    />
  );
};

export default ItemsList;