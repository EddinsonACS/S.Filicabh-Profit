// ItemModal.tsx
import { Inventario } from '@/core/models/Inventario';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  currentItem: Inventario | null;
  openEditModal: (item: Inventario) => void;
  handleDelete: (id: number) => void;
}

const { height } = Dimensions.get('window');

const ItemModal: React.FC<ItemModalProps> = ({
  visible,
  onClose,
  currentItem,
  openEditModal,
  handleDelete
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Configurar gesto para cerrar al deslizar hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Solo activar para movimientos verticales hacia abajo
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Solo permitir deslizar hacia abajo
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Si se desliza más de 100px, cerrar modal
          onClose();
        } else {
          // De lo contrario, volver a posición inicial
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

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

  // Función para determinar si hay configuración API
  const hasApiConfig = () => {
    try {
      if (currentItem.otrosC1) {
        const apiConfig = JSON.parse(currentItem.otrosC1 as string);
        return apiConfig && apiConfig.endpoint;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Extraer información de configuración API
  const getApiInfo = () => {
    try {
      if (currentItem.otrosC1) {
        return JSON.parse(currentItem.otrosC1 as string);
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const apiConfig = getApiInfo();

  // Confirmar eliminación
  const confirmDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar "${currentItem.nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => handleDelete(currentItem.id)
        }
      ]
    );
  };

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
            height: '80%'
          }}
          {...panResponder.panHandlers}
        >
          {/* Pull indicator */}
          <View className="absolute top-2 left-0 right-0 flex items-center z-10">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Main content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: 100 // Extra padding for buttons
            }}
            showsVerticalScrollIndicator={true}
            overScrollMode="always"
          >
            {/* Header with title and status */}
            <View className="bg-purple-900 px-4 pt-8 pb-4 rounded-b-3xl mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white text-2xl font-bold">{currentItem.nombre}</Text>
                <View className={`px-3 py-1 rounded-full ${currentItem.suspendido
                    ? 'bg-red-100 border border-red-300'
                    : 'bg-green-100 border border-green-300'
                  }`}>
                  <Text className={`font-medium text-sm ${currentItem.suspendido
                      ? 'text-red-700'
                      : 'text-green-700'
                    }`}>
                    {currentItem.suspendido ? 'Inactivo' : 'Activo'}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-2">
                <View className="bg-purple-800/50 px-3 py-1 rounded-full mr-2 flex-row items-center">
                  <Ionicons
                    name={currentItem.aplicaVentas ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={currentItem.aplicaVentas ? "#a5f3fc" : "#94a3b8"}
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-purple-100 text-xs">Ventas</Text>
                </View>

                <View className="bg-purple-800/50 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons
                    name={currentItem.aplicaCompras ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={currentItem.aplicaCompras ? "#a5f3fc" : "#94a3b8"}
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-purple-100 text-xs">Compras</Text>
                </View>
              </View>
            </View>

            {/* Card with info */}
            <View className="px-4 mb-4">
              {/* Configuración API (solo si existe y es un almacén) */}
              {hasApiConfig() && (
                <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cloud-outline" size={18} color="#7e22ce" style={{ marginRight: 8 }} />
                    <Text className="text-lg font-semibold text-gray-800">Configuración API</Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-500">Endpoint:</Text>
                    <Text className="text-gray-800 font-medium">{apiConfig?.endpoint || 'No configurado'}</Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-500">Autenticación:</Text>
                    <Text className="text-gray-800 font-medium">{apiConfig?.useAuth ? 'Habilitada' : 'Deshabilitada'}</Text>
                  </View>
                </View>
              )}

              {/* Información del sistema */}
              <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={18} color="#7e22ce" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-semibold text-gray-800">Información del Sistema</Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-500">ID:</Text>
                  <Text className="text-gray-800 font-medium">{currentItem.id}</Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-500">Fecha de Registro:</Text>
                  <Text className="text-gray-800 font-medium">{new Date(currentItem.fechaRegistro).toLocaleDateString()}</Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-500">Usuario Registro:</Text>
                  <Text className="text-gray-800 font-medium">{currentItem.usuarioRegistroNombre}</Text>
                </View>

                {currentItem.fechaModificacion && (
                  <View className="flex-row justify-between py-2 border-b border-gray-100">
                    <Text className="text-gray-500">Última Modificación:</Text>
                    <Text className="text-gray-800 font-medium">{new Date(currentItem.fechaModificacion).toLocaleDateString()}</Text>
                  </View>
                )}

                {currentItem.usuarioModificacionNombre && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-500">Usuario Modificación:</Text>
                    <Text className="text-gray-800 font-medium">{currentItem.usuarioModificacionNombre}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action buttons - Fixed at the bottom */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-8">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-red-100 py-3 rounded-lg flex-row justify-center items-center"
                onPress={confirmDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                <Text className="text-red-800 font-medium">Eliminar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-purple-100 py-3 rounded-lg flex-row justify-center items-center"
                onPress={() => {
                  onClose();
                  openEditModal(currentItem);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#7e22ce" style={{ marginRight: 6 }} />
                <Text className="text-purple-800 font-medium">Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default memo(ItemModal);