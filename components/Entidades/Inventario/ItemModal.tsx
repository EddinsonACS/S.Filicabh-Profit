// components/Inventory/ItemModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Inventario } from '@/core/models/Inventario';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  currentItem: Inventario | null;
  openEditModal: (item: Inventario) => void;
  handleDelete: (id: number) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({
  visible,
  onClose,
  currentItem,
  openEditModal,
  handleDelete
}) => {
  if (!currentItem) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-4">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Detalles</Text>
            <TouchableOpacity
              className="p-2"
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="bg-purple-50 rounded-lg p-4 mb-4">
            <Text className="text-2xl font-bold text-purple-900 mb-2">{currentItem.nombre}</Text>
            <View className={`self-start px-3 py-1 rounded-full ${currentItem.suspendido ? 'bg-red-100' : 'bg-green-100'} mb-4`}>
              <Text className={`text-sm font-medium ${currentItem.suspendido ? 'text-red-800' : 'text-green-800'}`}>
                {currentItem.suspendido ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 mb-1">Aplica Ventas</Text>
            <Text className="text-gray-800">{currentItem.aplicaVentas ? 'Sí' : 'No'}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 mb-1">Aplica Compras</Text>
            <Text className="text-gray-800">{currentItem.aplicaCompras ? 'Sí' : 'No'}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 mb-1">Fecha de Registro</Text>
            <Text className="text-gray-800">{new Date(currentItem.fechaRegistro).toLocaleDateString()}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 mb-1">Usuario Registro</Text>
            <Text className="text-gray-800">{currentItem.usuarioRegistroNombre}</Text>
          </View>

          <View className="flex-row mt-6">
            <TouchableOpacity
              className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
              onPress={() => {
                onClose();
                openEditModal(currentItem);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#4f46e5" style={{ marginRight: 6 }} />
              <Text className="text-indigo-700 font-medium">Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
              onPress={() => {
                onClose();
                handleDelete(currentItem.id);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
              <Text className="text-red-700 font-medium">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ItemModal;