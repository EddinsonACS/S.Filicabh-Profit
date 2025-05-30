import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  View
} from 'react-native';

interface DynamicItemListProps<T> {
  items: T[];
  handleDelete: (id: number) => void;
  showItemDetails: (item: T) => void;
  openEditModal: (item: T) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  selectedCategory: string;
  renderItem: ListRenderItem<T>;
  emptyStateComponent?: React.ComponentType<any> | React.ReactElement | null;
  keyExtractor: (item: T) => string;
}

const DynamicItemList = <T,>({
  items,
  showItemDetails,
  onLoadMore,
  hasMore,
  selectedCategory,
  renderItem,
  emptyStateComponent,
  keyExtractor
}: DynamicItemListProps<T>) => {
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 items-center">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#581c87" />
          </View>
      </View>
    );
  };

  return (
    <FlatList
      data={items}
      ListEmptyComponent={emptyStateComponent}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
    />
  );
};

export default DynamicItemList; 