// components/Inventory/ItemModal.tsx
import { inventoryCategories } from '@/components/Entidades/Inventario/EntInventarioData';
import { InventoryItem } from '@/components/Entidades/Inventario/InventoryTypes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  currentItem: InventoryItem | null;
  openEditModal: (item: InventoryItem) => void;
  handleDelete: (id: string) => void;
}

const { height } = Dimensions.get('window');

const ItemModal: React.FC<ItemModalProps> = ({
  visible,
  onClose,
  currentItem,
  openEditModal,
  handleDelete
}) => {
  const translateY = React.useRef(new Animated.Value(height)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!currentItem) return null;

  // Get the category color from inventoryCategories
  const getCategoryColor = (type: string) => {
    const category = inventoryCategories.find(cat => cat.type === type);
    return {
      primary: category?.color || '#581c87',
      light: category?.lightColor || '#f3e8ff'
    };
  };

  const colors = getCategoryColor(currentItem.type);
  
  const DetailField = ({ label, value, isLarge = false }: { label: string; value: string | number | undefined; isLarge?: boolean }) => (
    <View className={`mb-4 ${isLarge ? 'bg-gray-50 p-3 rounded-lg' : ''}`}>
      <Text className="text-gray-500 mb-1 text-sm">{label}</Text>
      <Text className={`${isLarge ? 'text-base' : 'text-sm'} text-gray-800 ${isLarge ? 'font-medium' : ''}`}>
        {value || 'No definido'}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // We use our own animation
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.5)', opacity }
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          className="h-[80%]" // Changed from 75% to 80% as requested
          style={{
            transform: [{ translateY }],
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Header with curved design - Removed back arrow and edit button */}
          <View
            className="py-6 px-4 rounded-t-3xl"
            style={{ backgroundColor: colors.primary }}
          >
            <View className="absolute top-2 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-white/30 rounded-full" />
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-xl font-bold">Detalles</Text>
              
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Badge status */}
            <View className="mt-2 flex-row justify-between items-center">
              <Text className="text-white text-2xl font-bold">{currentItem.name}</Text>
              <View className={`px-3 py-1 rounded-full ${
                currentItem.status === 'active' ? 'bg-green-400/20' : 'bg-red-400/20'
              }`}>
                <Text className="text-white font-medium text-sm">
                  {currentItem.status === 'active' ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>

          {/* Main content */}
          <ScrollView className="flex-1 px-4">
            {currentItem.image && currentItem.type === 'article' && (
              <View className="mt-4 rounded-lg overflow-hidden shadow-sm">
                <Image
                  source={{ uri: currentItem.image }}
                  className="w-full h-48 bg-gray-200"
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Quick stats */}
            {currentItem.type === 'article' && (
              <View className="flex-row mt-6 mb-4">
                <View className="flex-1 bg-purple-50 p-3 rounded-lg mr-1 items-center">
                  <Text className="text-sm text-purple-500 mb-1">Precio</Text>
                  <Text className="text-xl font-bold text-purple-900">
                    Bs. {currentItem.price?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View className="flex-1 bg-blue-50 p-3 rounded-lg ml-1 items-center">
                  <Text className="text-sm text-blue-500 mb-1">Stock</Text>
                  <Text className="text-xl font-bold text-blue-900">
                    {currentItem.stock || '0'}
                  </Text>
                </View>
              </View>
            )}

            {/* Fields */}
            <View className="mt-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">Información</Text>
              
              <DetailField 
                label="Descripción" 
                value={currentItem.description} 
                isLarge 
              />
              
              <DetailField 
                label="Código" 
                value={currentItem.code} 
              />
              
              {currentItem.type === 'article' && (
                <>
                  <DetailField label="Categoría" value={currentItem.category} />
                  <DetailField label="Grupo" value={currentItem.group} />
                </>
              )}
              
              <DetailField label="Fecha de creación" value={currentItem.createdAt} />
              
              <DetailField 
                label="Tipo" 
                value={inventoryCategories.find(cat => cat.type === currentItem.type)?.title || currentItem.type} 
              />
            </View>
            
            {/* Additional fields for articles */}
            {currentItem.type === 'article' && currentItem.unit && (
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Especificaciones</Text>
                
                <View className="bg-gray-50 p-4 rounded-lg mb-4">
                  <View className="flex-row flex-wrap">
                    {currentItem.unit && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-gray-500 text-xs">Unidad</Text>
                        <Text className="text-gray-800">{currentItem.unit}</Text>
                      </View>
                    )}
                    
                    {currentItem.size && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-gray-500 text-xs">Talla/Tamaño</Text>
                        <Text className="text-gray-800">{currentItem.size}</Text>
                      </View>
                    )}
                    
                    {currentItem.color && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-gray-500 text-xs">Color</Text>
                        <Text className="text-gray-800">{currentItem.color}</Text>
                      </View>
                    )}
                    
                    {currentItem.taxType && (
                      <View className="w-1/2 mb-3">
                        <Text className="text-gray-500 text-xs">Tipo de impuesto</Text>
                        <Text className="text-gray-800">{currentItem.taxType}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Action buttons - with bottom margin */}
            <View className="flex-row mb-12 mt-4">
              <TouchableOpacity
                className="flex-1 bg-purple-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                onPress={() => {
                  onClose();
                  openEditModal(currentItem);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#7e22ce" style={{ marginRight: 6 }} />
                <Text className="text-purple-800 font-medium">Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
                onPress={() => {
                  onClose();
                  handleDelete(currentItem.id);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                <Text className="text-red-800 font-medium">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ItemModal;