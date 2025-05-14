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
  const scrollViewRef = useRef<ScrollView>(null);

  // Cerrar al deslizar hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < 100;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && gestureState.y0 < 100;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
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
      animationType="none"
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
        >
          {/* Header */}
          <View
            className="bg-purple-900 rounded-xl mb-4 p-6"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center z-10">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold" numberOfLines={1}>{currentItem.nombre}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row space-x-2">
                <View className="bg-purple-800/50 p-2 rounded-full flex-row items-center">
                  <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                    {currentItem.aplicaVentas ? (
                      <>
                        <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                        <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                      </>
                    ) : (
                      <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                    )}
                  </View>
                  <Text className="text-white text-xs ml-1">Ventas</Text>
                </View>
                <View className="bg-purple-800/50 px-3 py-1 rounded-full flex-row items-center">
                  <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                    {currentItem.aplicaCompras ? (
                      <>
                        <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                        <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                      </>
                    ) : (
                      <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                    )}
                  </View>
                  <Text className="text-white text-xs ml-1">Compras</Text>
                </View>
              </View>

              <View className={`p-2 rounded-full ${currentItem.suspendido
                ? 'bg-red-100 border border-red-600'
                : 'bg-green-100 border border-green-600'
                }`}>
                <Text className={`font-bold ${currentItem.suspendido
                  ? 'text-red-600'
                  : 'text-green-600'
                  }`}>
                  {currentItem.suspendido ? 'Inactivo' : 'Activo'}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content - Área con scroll */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: 100
            }}
            showsVerticalScrollIndicator={true}
            overScrollMode="always"
            bounces={true}
            alwaysBounceVertical={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            {/* Card */}
            <View className="px-4 mb-4">
              {/* Información del sistema */}
              <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle-outline" size={20} color="#7e22ce" />
                  <Text className="text-lg font-semibold text-gray-800 ml-1">Información del Sistema</Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-300">
                  <Text className="text-gray-500">ID:</Text>
                  <Text className="text-gray-800 font-medium">{currentItem.id}</Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-300">
                  <Text className="text-gray-500">Fecha de Registro:</Text>
                  <Text className="text-gray-800 font-medium">{new Date(currentItem.fechaRegistro).toLocaleDateString()}</Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-300">
                  <Text className="text-gray-500">Usuario Registro:</Text>
                  <Text className="text-gray-800 font-medium">{currentItem.usuarioRegistroNombre}</Text>
                </View>
                {currentItem.fechaModificacion && (
                  <View className="flex-row justify-between py-2 border-b border-gray-300">
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

          {/* Action buttons */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 px-8">
            <View className="flex-row space-x-4 mt-1">
              <TouchableOpacity
                className="flex-1 bg-red-100 py-3 rounded-lg flex-row justify-center items-center"
                onPress={confirmDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                <Text className="text-red-800 font-medium ml-2">Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-purple-100 py-3 rounded-lg flex-row justify-center items-center"
                onPress={() => {
                  onClose();
                  openEditModal(currentItem);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#7e22ce" />
                <Text className="text-purple-800 font-medium ml-2">Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default memo(ItemModal);