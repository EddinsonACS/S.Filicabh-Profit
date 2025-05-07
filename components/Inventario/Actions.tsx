import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

type ActionsProps = {
  viewModalVisible: boolean;
  deleteModalVisible: boolean;
  selectedArticle: Article | null;
  onCloseViewModal: () => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  onEdit: () => void;
  formatPrice: (price: number) => string;
  getCategoryName: (categoryId: string) => string;
};

export default function Actions({
  viewModalVisible,
  deleteModalVisible,
  selectedArticle,
  onCloseViewModal,
  onCloseDeleteModal,
  onConfirmDelete,
  onEdit,
  formatPrice,
  getCategoryName,
}: ActionsProps) {
  
  return (
    <View>
      {/* Modal para ver detalles */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={onCloseViewModal}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            <View className="p-5">
              {selectedArticle && (
                <>
                  {/* Imagen del artículo */}
                  <View className="items-center mb-4">
                    <View className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden items-center justify-center">
                      {selectedArticle.imageUrl ? (
                        <Image source={{ uri: selectedArticle.imageUrl }} className="w-full h-full" />
                      ) : (
                        <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                      )}
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-800 text-xl font-bold">{selectedArticle.name}</Text>
                    <Text className="text-gray-600 mt-1">{selectedArticle.description}</Text>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Código:</Text>
                    <Text className="text-gray-800 font-medium">{selectedArticle.code}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Precio:</Text>
                    <Text className="text-gray-800 font-bold">{formatPrice(selectedArticle.price)}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Categoría:</Text>
                    <Text className="text-gray-800">{getCategoryName(selectedArticle.category)}</Text>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Stock disponible:</Text>
                    <View className="bg-gray-100 rounded-full px-2 py-0.5">
                      <Text className="text-gray-800 font-medium">{selectedArticle.stock} unidades</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Creado:</Text>
                    <Text className="text-gray-800">{selectedArticle.createdAt.toLocaleDateString()}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-600">Actualizado:</Text>
                    <Text className="text-gray-800">{selectedArticle.updatedAt.toLocaleDateString()}</Text>
                  </View>
                  
                  <View className="flex-row mt-5 pt-4 border-t border-gray-200">
                    <TouchableOpacity
                      className="flex-1 mr-2 bg-gray-100 py-3 rounded-lg"
                      onPress={() => {
                        onCloseViewModal();
                        onEdit();
                      }}
                    >
                      <Text className="text-gray-800 font-medium text-center">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-gray-200 py-3 rounded-lg"
                      onPress={onCloseViewModal}
                    >
                      <Text className="text-gray-800 font-medium text-center">Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={onCloseDeleteModal}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            <View className="p-5">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Ionicons name="trash-outline" size={32} color="#dc2626" />
                </View>
                <Text className="text-gray-800 text-lg font-bold text-center">
                  ¿Eliminar artículo?
                </Text>
              </View>
              
              {selectedArticle && (
                <Text className="text-gray-600 text-center mb-4">
                  ¿Estás seguro que deseas eliminar "{selectedArticle.name}"? Esta acción no se puede deshacer.
                </Text>
              )}
              
              <View className="flex-row mt-2">
                <TouchableOpacity
                  className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg"
                  onPress={onCloseDeleteModal}
                >
                  <Text className="text-gray-800 font-medium text-center">Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-red-600 py-3 rounded-lg"
                  onPress={onConfirmDelete}
                >
                  <Text className="text-white font-medium text-center">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
