// components/Inventory/FormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Switch } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventorySchema, InventoryFormData } from '@/utils/schemas/inventorySchema';
import { Inventario } from '@/core/models/Inventario';

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem?: Inventario | null;
  handleCreate: (data: InventoryFormData) => void;
  handleUpdate: (data: InventoryFormData) => void;
}

const FormModal: React.FC<FormModalProps> = ({
  visible,
  onClose,
  isEditing,
  currentItem,
  handleCreate,
  handleUpdate
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      nombre: currentItem?.nombre || '',
    }
  });

  React.useEffect(() => {
    if (currentItem) {
      reset({
        nombre: currentItem.nombre,
        aplicaVentas: currentItem.aplicaVentas,
        aplicaCompras: currentItem.aplicaCompras,
        suspendido: currentItem.suspendido
      });
    } else {
      reset({
        nombre: '',
        aplicaVentas: false,
        aplicaCompras: false,
        suspendido: false
      });
    }
  }, [currentItem, reset]);

  const onSubmit = (data: InventoryFormData) => {
    if (isEditing) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

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
            <Text className="text-xl font-bold text-gray-800">
              {isEditing ? 'Editar Item' : 'Nuevo Item'}
            </Text>
            <TouchableOpacity
              className="p-2"
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[80vh]">
            <View className="space-y-4">
              {/* Nombre */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
                <Controller
                  control={control}
                  name="nombre"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className={`w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 ${errors.nombre ? 'border-red-500' : ''}`}
                      placeholder="Nombre del item"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.nombre && (
                  <Text className="text-red-500 text-sm mt-1">{errors.nombre.message}</Text>
                )}
              </View>

              {/* Aplica Ventas */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">Aplica Ventas</Text>
                <Controller
                  control={control}
                  name="aplicaVentas"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#d1d5db', true: '#7e22ce' }}
                      thumbColor={value ? '#581c87' : '#f4f3f4'}
                    />
                  )}
                />
              </View>

              {/* Aplica Compras */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">Aplica Compras</Text>
                <Controller
                  control={control}
                  name="aplicaCompras"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#d1d5db', true: '#7e22ce' }}
                      thumbColor={value ? '#581c87' : '#f4f3f4'}
                    />
                  )}
                />
              </View>

              {/* Suspendido */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">Suspendido</Text>
                <Controller
                  control={control}
                  name="suspendido"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                      thumbColor={value ? '#dc2626' : '#f4f3f4'}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>

          <View className="flex-row mt-6">
            <TouchableOpacity
              className="flex-1 bg-purple-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
              onPress={handleSubmit(onSubmit)}
            >
              <Ionicons name="save-outline" size={18} color="#7e22ce" style={{ marginRight: 6 }} />
              <Text className="text-purple-700 font-medium">
                {isEditing ? 'Actualizar' : 'Crear'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
              onPress={onClose}
            >
              <Ionicons name="close-outline" size={18} color="#4b5563" style={{ marginRight: 6 }} />
              <Text className="text-gray-600 font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FormModal;