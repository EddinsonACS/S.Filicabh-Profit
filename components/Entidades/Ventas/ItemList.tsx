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
import { SalesItem } from './VentasTypes';

interface ItemsListProps {
  items: SalesItem[];
  handleDelete: (id: string) => void;
  showItemDetails: (item: SalesItem) => void;
  openEditModal: (item: SalesItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  showItemDetails,
  onLoadMore,
  hasMore
}) => {
  const ItemComponent = ({ item }: { item: SalesItem }) => (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => showItemDetails(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.name}</Text>
          </View>
          
          {item.description && (
            <Text className="text-gray-600 mb-2" numberOfLines={1}>{item.description}</Text>
          )}
          
          <View className="flex-row justify-between items-center mt-1">
            {item.type === 'exchangeRate' ? (
              <View className="flex-row space-x-2">
                <Text className="text-sm text-gray-800">
                  Valor: {item.value || 'N/A'}
                </Text>
              </View>
            ) : (
              <View className="flex-row space-x-2">
                {/* Indicadores específicos del tipo */}
                {item.indicators && item.indicators.map((indicator, index) => (
                  <View key={index} className="flex-row items-center">
                    <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                      {indicator.enabled ? (
                        <>
                          <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                          <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                        </>
                      ) : (
                        <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                      )}
                    </View>
                    <Text className="text-sm text-gray-800 ml-1">
                      {indicator.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Estado */}
            <View className={`px-2 py-1 rounded-full ${item.status !== 'active'
              ? 'bg-red-100 border border-red-600'
              : 'bg-green-100 border border-green-600'
              }`}>
              <Text className={`text-xs font-medium ${item.status !== 'active'
                ? 'text-red-600'
                : 'text-green-600'
                }`}>
                {item.status === 'active' ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          {/* Información adicional */}
          <Text className="text-xs text-gray-400 mt-2">
            ID: {item.id} · Código: {item.code || 'N/A'}
          </Text>
          <Text className="text-xs text-gray-400">
            Creado: {item.createdAt}
          </Text>
          {item.updatedAt && (
            <Text className="text-xs text-gray-400">
              Ultima modificación: {item.updatedAt}
            </Text>
          )}
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