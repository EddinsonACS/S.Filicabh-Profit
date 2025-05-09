// FormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Switch,
  Alert,
  PanResponder
} from 'react-native';
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
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Form handling with React Hook Form
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

  // API Configuration fields (only for 'almacen' category)
  const [apiConfig, setApiConfig] = useState({
    endpoint: '',
    apiKey: '',
    useAuth: false
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

      // Si el elemento actual tiene datos de configuración API
      if (currentItem.otrosC1) {
        try {
          const apiData = JSON.parse(currentItem.otrosC1 as string);
          if (apiData && typeof apiData === 'object') {
            setApiConfig({
              endpoint: apiData.endpoint || '',
              apiKey: apiData.apiKey || '',
              useAuth: apiData.useAuth || false
            });
          }
        } catch (e) {
          // Si no se puede parsear, usar valores por defecto
          setApiConfig({
            endpoint: '',
            apiKey: '',
            useAuth: false
          });
        }
      }
    } else {
      reset({
        nombre: '',
        aplicaVentas: false,
        aplicaCompras: false,
        suspendido: false
      });
      setApiConfig({
        endpoint: '',
        apiKey: '',
        useAuth: false
      });
    }
  }, [currentItem, reset]);

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
    // Para almacén, guardar la configuración API en otrosC1
    if (selectedCategory === 'almacen' && !isEditing) {
      const formDataWithApi = {
        ...data,
        otrosC1: JSON.stringify(apiConfig)
      };

      if (isEditing && currentItem) {
        handleUpdate(formDataWithApi);
      } else {
        handleCreate(formDataWithApi);
      }
    } else {
      // Para otras categorías, enviar los datos normales
      if (isEditing && currentItem) {
        handleUpdate(data);
      } else {
        handleCreate(data);
      }
    }
  };

  // Validar la configuración API
  const validateApiConfig = () => {
    if (selectedCategory === 'almacen' && !isEditing && apiConfig.useAuth) {
      if (!apiConfig.endpoint) {
        Alert.alert('Error', 'Debe especificar un endpoint para la API');
        return false;
      }
      if (!apiConfig.apiKey) {
        Alert.alert('Error', 'Debe especificar una clave API');
        return false;
      }
    }
    return true;
  };

  // Función para manejar el envío con validaciones adicionales
  const handleFormSubmit = () => {
    if (validateApiConfig()) {
      handleSubmit(onSubmit)();
    }
  };

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
      animationType="none" // Using our own animation
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
          {/* Header con diseño curvo */}
          <View className="bg-purple-900 py-6 px-4 rounded-t-3xl">
            <View className="absolute top-2 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-white/30 rounded-full" />
            </View>

            <Text className="text-white text-xl font-bold">
              {isEditing ? 'Editar' : 'Nuevo'} {getCategoryTitle()}
            </Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            {/* Content area - unified all fields in one scrollable area */}
            <ScrollView
              className="flex-1 px-4 pt-4"
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              overScrollMode="always"
            >
              {/* Nombre */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
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

              {/* Main switches group */}
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <Text className="text-gray-800 font-medium mb-3">Configuración general</Text>
                
                {/* Aplica Ventas */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
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
                        trackColor={{ false: '#d1d5db', true: '#7e22ce' }}
                        thumbColor={value ? '#581c87' : '#f4f3f4'}
                      />
                    )}
                  />
                </View>

                {/* Aplica Compras */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
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
                        trackColor={{ false: '#d1d5db', true: '#7e22ce' }}
                        thumbColor={value ? '#581c87' : '#f4f3f4'}
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

              {/* API Configuration - Only for Almacén category but NOT in Edit mode */}
              {selectedCategory === 'almacen' && !isEditing && (
                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-800 font-medium">Configuración API</Text>
                    <Switch
                      value={apiConfig.useAuth}
                      onValueChange={(value) => setApiConfig({ ...apiConfig, useAuth: value })}
                      trackColor={{ false: '#d1d5db', true: '#7e22ce' }}
                      thumbColor={apiConfig.useAuth ? '#581c87' : '#f4f3f4'}
                    />
                  </View>
                  
                  {apiConfig.useAuth && (
                    <>
                      <View className="mb-3">
                        <Text className="text-sm text-gray-700 mb-1">Endpoint API</Text>
                        <TextInput
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                          placeholder="https://api.ejemplo.com/v1"
                          value={apiConfig.endpoint}
                          onChangeText={(text) => setApiConfig({ ...apiConfig, endpoint: text })}
                        />
                      </View>

                      <View className="mb-2">
                        <Text className="text-sm text-gray-700 mb-1">API Key</Text>
                        <TextInput
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                          placeholder="Clave API"
                          value={apiConfig.apiKey}
                          onChangeText={(text) => setApiConfig({ ...apiConfig, apiKey: text })}
                          secureTextEntry={true}
                        />
                      </View>
                    </>
                  )}
                  
                  <Text className="text-blue-800 text-xs mt-2">
                    {apiConfig.useAuth 
                      ? "La autenticación API está habilitada. Complete todos los campos." 
                      : "Active el interruptor para configurar la conexión API."}
                  </Text>
                </View>
              )}

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

            {/* Bottom buttons */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-8">
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                  onPress={onClose}
                >
                  <Ionicons name="close-outline" size={18} color="#4b5563" style={{ marginRight: 6 }} />
                  <Text className="text-gray-600 font-medium">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ml-2 flex-row justify-center items-center ${isValid && isDirty ? 'bg-purple-600' : 'bg-purple-300'
                    }`}
                  onPress={handleFormSubmit}
                  disabled={!isValid || !isDirty}
                >
                  <Ionicons name="save-outline" size={18} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-medium">
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