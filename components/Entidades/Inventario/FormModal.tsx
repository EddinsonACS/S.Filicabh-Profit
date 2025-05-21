import { Almacen } from '@/core/models/Almacen';
import { InventoryFormData, inventorySchema } from '@/utils/schemas/inventorySchema';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem?: Almacen | null;
  handleCreate: (data: InventoryFormData) => void;
  handleUpdate: (data: InventoryFormData) => void;
  selectedCategory: string;
}

const { height } = Dimensions.get('window');

const FormModal: React.FC<FormModalProps> = ({
  visible,
  onClose,
  isEditing,
  currentItem,
  handleCreate,
  handleUpdate,
  selectedCategory
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      nombre: '',
      aplicaVentas: false,
      aplicaCompras: false,
      suspendido: false
    },
    mode: 'onChange'
  });

  // Reset form when currentItem changes
  useEffect(() => {
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

  // Cerrar al deslizar hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < 50;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && gestureState.y0 < 50;
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

  // Manejar animaciones cuando cambia la visibilidad
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

  // Function to handle form submission
  const onSubmit = (data: InventoryFormData) => {
    if (isEditing && currentItem) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  // Función para manejar el envío con validaciones adicionales
  const handleFormSubmit = () => {
    handleSubmit(onSubmit)();
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  }

  // Obtener el título correcto según la categoría
  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'almacen': return 'Almacén';
      case 'articulo': return 'Artículo';
      case 'categoria': return 'Categoría';
      case 'grupo': return 'Grupo';
      case 'unidad': return 'Unidad';
      case 'color': return 'Color';
      case 'impuesto': return 'Impuesto';
      case 'origen': return 'Origen';
      default: return 'Elemento';
    }
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
            className="bg-purple-900 p-4 rounded-xl"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-white text-xl text-center font-bold mt-1">
              {isEditing ? 'Editar' : 'Nuevo'} {getCategoryTitle()}
            </Text>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            {/* Content */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 pt-4"
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              overScrollMode="always"
              bounces={true}
              alwaysBounceVertical={true}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Nombre */}
              <View className="mb-4">
                <View className="flex-row mb-1">
                  <Text className="text-sm font-medium text-gray-700">Nombre </Text>
                  <Text className="text-red-600">*</Text>
                </View>
                <Controller
                  control={control}
                  name="nombre"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${errors.nombre ? 'border-red-500' : 'border-gray-200'}`}
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

              {/* Main */}
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <Text className="text-gray-800 font-medium mb-3">Configuración general</Text>

                {/* Aplica Ventas */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-300">
                  <View>
                    <Text className="text-gray-700 font-medium">Aplica Ventas</Text>
                    <Text className="text-gray-500 text-xs">El artículo está disponible para ventas</Text>
                  </View>
                  <Controller
                    control={control}
                    name="aplicaVentas"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ false: '#d1d5db', true: '#00FF15FF' }}
                        thumbColor={value ? '#10E422FF' : '#f4f3f4'}
                      />
                    )}
                  />
                </View>

                {/* Aplica Compras */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-300">
                  <View>
                    <Text className="text-gray-700 font-medium">Aplica Compras</Text>
                    <Text className="text-gray-500 text-xs">El artículo está disponible para compras</Text>
                  </View>
                  <Controller
                    control={control}
                    name="aplicaCompras"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ false: '#d1d5db', true: '#00FF15FF' }}
                        thumbColor={value ? '#10E422FF' : '#f4f3f4'}
                      />
                    )}
                  />
                </View>

                {/* Suspendido */}
                <View className="flex-row justify-between items-center pt-2">
                  <View>
                    <Text className="text-gray-700 font-medium">Suspendido</Text>
                    <Text className="text-gray-500 text-xs">El artículo está inactivo</Text>
                  </View>
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

              {/* System Information - Only for editing mode */}
              {isEditing && currentItem && (
                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <Text className="text-gray-800 font-medium mb-2">Información del Sistema</Text>
                  <View className="flex-row justify-between my-1">
                    <Text className="text-gray-500">ID:</Text>
                    <Text className="text-gray-800">{currentItem.id}</Text>
                  </View>
                  <View className="flex-row justify-between my-1">
                    <Text className="text-gray-500">Fecha Registro:</Text>
                    <Text className="text-gray-800">{new Date(currentItem.fechaRegistro).toLocaleDateString()}</Text>
                  </View>
                  <View className="flex-row justify-between my-1">
                    <Text className="text-gray-500">Usuario Registro:</Text>
                    <Text className="text-gray-800">{currentItem.usuarioRegistroNombre}</Text>
                  </View>
                  {currentItem.fechaModificacion && (
                    <View className="flex-row justify-between my-1">
                      <Text className="text-gray-500">Última Modificación:</Text>
                      <Text className="text-gray-800">{new Date(currentItem.fechaModificacion).toLocaleDateString()}</Text>
                    </View>
                  )}
                  {currentItem.usuarioModificacionNombre && (
                    <View className="flex-row justify-between my-1">
                      <Text className="text-gray-500">Usuario Modificación:</Text>
                      <Text className="text-gray-800">{currentItem.usuarioModificacionNombre}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 px-8">
              <View className="flex-row mt-1">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                  onPress={handleClose}
                >
                  <Ionicons name="close-outline" size={18} color="#4b5563" />
                  <Text className="text-gray-800 font-medium ml-2">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ml-2 flex-row justify-center items-center ${isValid && isDirty ? 'bg-purple-100' : 'bg-purple-100'
                    }`}
                  onPress={handleFormSubmit}
                  disabled={!isValid || !isDirty}
                >
                  <Ionicons name="save-outline" size={18} color="#7e22ce" />
                  <Text className="text-purple-800 font-medium ml-2">
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FormModal;