import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'switch' | 'select';
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
}

interface DynamicFormModalProps {
  backendError?: string | null;
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem: any;
  handleCreate: (data: any) => Promise<boolean>; // Returns true on success, false on error
  handleUpdate: (data: any) => Promise<boolean>; // Returns true on success, false on error
  selectedCategory: string;
  schema: z.ZodType<any>;
  defaultValues: Record<string, any>;
  categoryTitles: Record<string, string>;
  formFields: Array<FormField>;
  headerColor: string;
  headerTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  switchActiveColor: string;
  switchInactiveColor: string;
}

const { height } = Dimensions.get('window');

// Funciones de formateo automático
const formatName = (text: string): string => {
  return text
    .split(' ')
    .join(' ');
};

const formatAccountNumber = (text: string): string => {
  return text.replace(/\D/g, ''); // Solo números
};

const formatEmail = (text: string): string => {
  return text.toLowerCase();
};

const formatCode = (text: string): string => {
  return text.toUpperCase();
};

const formatRIF = (text: string): string => {
  // Formato RIF: J-12345678-9
  let cleaned = text.replace(/[^A-Za-z0-9]/g, '');
  if (cleaned.length > 0) {
    let formatted = cleaned.charAt(0).toUpperCase();
    if (cleaned.length > 1) {
      formatted += '-' + cleaned.slice(1, 9);
      if (cleaned.length > 9) {
        formatted += '-' + cleaned.slice(9, 10);
      }
    }
    return formatted;
  }
  return text;
};

const formatNIT = (text: string): string => {
  return text.replace(/\D/g, ''); // Solo números
};

const formatDecimalNumber = (text: string): string => {
  // Permite números decimales con coma o punto como separador
  let cleaned = text.replace(/[^0-9,.-]/g, '');
  
  // Si hay coma, la convertimos a punto para el valor interno
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  
  // Asegurar que solo hay un punto decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
};

const formatInteger = (text: string): string => {
  return text.replace(/\D/g, ''); // Solo números enteros
};

const formatPercentage = (text: string): string => {
  // Para porcentajes, permitir decimales pero limitar a 100
  let cleaned = text.replace(/[^0-9,.-]/g, '');
  
  // Si termina en punto o coma, permitir continuar escribiendo
  if (cleaned.endsWith('.') || cleaned.endsWith(',')) {
    return cleaned;
  }
  
  // Convertir coma a punto para validación
  let valueForValidation = cleaned;
  if (valueForValidation.includes(',')) {
    valueForValidation = valueForValidation.replace(',', '.');
  }
  
  // Asegurar que solo hay un punto decimal
  const parts = valueForValidation.split('.');
  if (parts.length > 2) {
    valueForValidation = parts[0] + '.' + parts.slice(1).join('');
  }
  
  const numValue = parseFloat(valueForValidation);
  if (!isNaN(numValue) && numValue > 100) {
    return '100';
  }
  
  // Devolver el valor original con coma si la tenía
  if (cleaned.includes(',')) {
    return cleaned.replace(',', '.');
  }
  
  return valueForValidation;
};

const getFormattedValue = (fieldName: string, text: string): string => {
  // Campos que deben formatear nombres (cada palabra con mayúscula)
  if (['nombre', 'nombreEjecutivo', 'sucursal', 'personaContacto'].includes(fieldName)) {
    return formatName(text);
  }
  
  // Campos que deben ser solo números enteros
  if (['nroCuenta', 'telefono', 'dias', 'nit'].includes(fieldName)) {
    return formatInteger(text);
  }
  
  // Campos de email
  if (['email', 'emailAlterno'].includes(fieldName)) {
    return formatEmail(text);
  }
  
  // Campos de dirección (primera letra de cada palabra en mayúscula)
  if (['direccion', 'direccionComercial', 'direccionEntrega', 'descripcionFiguraComercial'].includes(fieldName)) {
    return formatName(text);
  }
  
  // Campos de código (mayúsculas)
  if (['codigo'].includes(fieldName)) {
    return formatCode(text);
  }
  
  // Campo RIF (formato especial)
  if (fieldName === 'rif') {
    return formatRIF(text);
  }
  
  // Campo de porcentaje (0-100)
  if (fieldName === 'porceRetencionIva') {
    return formatPercentage(text);
  }
  
  // Campos de números decimales (tasas, montos)
  if (['tasaVenta', 'tasaCompra', 'montolimiteCreditoVentas', 'montolimiteCreditoCompras'].includes(fieldName)) {
    return formatDecimalNumber(text);
  }
  
  return text;
};

const getKeyboardType = (fieldName: string, fieldType: string) => {
  if (fieldType === 'number') return 'numeric';
  if (['nroCuenta', 'telefono', 'dias', 'nit'].includes(fieldName)) return 'numeric';
  if (['tasaVenta', 'tasaCompra', 'montolimiteCreditoVentas', 'montolimiteCreditoCompras', 'porceRetencionIva'].includes(fieldName)) return 'decimal-pad';
  if (['email', 'emailAlterno'].includes(fieldName)) return 'email-address';
  return 'default';
};

const convertValueForSubmission = (fieldName: string, value: string | number): string | number => {
  // Convertir valores con punto decimal para envío al backend
  if (typeof value === 'string' && ['tasaVenta', 'tasaCompra', 'montolimiteCreditoVentas', 'montolimiteCreditoCompras', 'porceRetencionIva'].includes(fieldName)) {
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? 0 : numericValue;
  }
  return value;
};

const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  visible,
  onClose,
  isEditing,
  currentItem,
  handleCreate,
  handleUpdate,
  selectedCategory,
  schema,
  defaultValues,
  categoryTitles,
  formFields,
  headerColor,
  headerTextColor,
  buttonColor,
  buttonTextColor,
  switchActiveColor,
  switchInactiveColor,
  backendError
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditing && currentItem ? currentItem : defaultValues
  });

  // Estado para controlar el selector abierto
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (isEditing && currentItem) {
        reset(currentItem);
      } else {
        reset(defaultValues);
      }
    }
  }, [visible, isEditing, currentItem, defaultValues, reset]);

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => gestureState.y0 < 50,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && gestureState.y0 < 50,
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

  const onSubmit = async (data: any) => {
    let success = false;
    if (isEditing) {
      success = await handleUpdate(data); 
    } else {
      success = await handleCreate(data);
    }

    if (success) {
      reset(); 
      onClose(); 
    }
    // If not successful, the modal remains open, and the parent component is expected to pass the backendError prop.
  };

  // Separar campos de texto/número, switches y selects
  const textFields = formFields.filter(f => f.type === 'text' || f.type === 'number');
  const switchFields = formFields.filter(f => f.type === 'switch');
  const selectFields = formFields.filter(f => f.type === 'select');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity
          }
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
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
            height: '85%',
            maxHeight: height - 30
          }}
        >
          <View
            style={{ backgroundColor: headerColor }}
            className="p-4 rounded-xl"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text style={{ color: headerTextColor }} className="text-xl text-center font-bold mt-4">
              {isEditing ? 'Editar' : 'Nuevo'} {categoryTitles[selectedCategory]}
            </Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 10}
          >
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 pt-4"
              contentContainerStyle={{ 
                paddingBottom: 250,
                flexGrow: 1
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              scrollToOverflowEnabled={true}
              bounces={true}
            >
              {/* Campos de texto y número */}
              {textFields.map((field) => (
                <View key={field.name} className="mb-4">
                  <View className="flex-row mb-1">
                    <Text className="text-sm font-medium text-gray-700">{field.label}</Text>
                    {field.required && <Text className="text-red-600">*</Text>}
                  </View>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder={field.placeholder}
                        value={String(value || '')}
                        onChangeText={(text) => {
                          const formattedText = getFormattedValue(field.name, text);
                          // Para campos numéricos, convertir el valor apropiadamente
                          if (field.type === 'number') {
                            const convertedValue = convertValueForSubmission(field.name, formattedText);
                            onChange(convertedValue);
                          } else {
                            onChange(formattedText);
                          }
                        }}
                        keyboardType={getKeyboardType(field.name, field.type)}
                        returnKeyType="next"
                        autoCorrect={false}
                        autoCapitalize="none"
                        selectTextOnFocus={false}
                        clearButtonMode="while-editing"
                      />
                    )}
                  />
                  {field.description && (
                    <Text className="text-gray-500 text-xs mt-1">{field.description}</Text>
                  )}
                  {errors[field.name] && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors[field.name]?.message as string}
                    </Text>
                  )}
                </View>
              ))}

              {/* Campos de selección */}
              {selectFields.map((field) => (
                <View key={field.name} className="mb-4">
                  <View className="flex-row mb-1">
                    <Text className="text-sm font-medium text-gray-700">{field.label}</Text>
                    {field.required && <Text className="text-red-600">*</Text>}
                  </View>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => {
                      const selectedOption = field.options?.find(
                        opt => opt[field.optionValue || 'id'] === value
                      );
                      
                      return (
                        <View>
                          <TouchableOpacity
                            onPress={() => setOpenSelect(openSelect === field.name ? null : field.name)}
                            className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${
                              errors[field.name] ? 'border-red-500' : 'border-gray-200'
                            }`}
                          >
                            <Text className="text-gray-700">
                              {selectedOption ? selectedOption[field.optionLabel || 'nombre'] : 'Seleccione una opción'}
                            </Text>
                            <Ionicons 
                              name={openSelect === field.name ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color="#6B7280" 
                            />
                          </TouchableOpacity>

                          {openSelect === field.name && (
                            <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-48">
                              <ScrollView className="max-h-48">
                                {field.options?.map((option) => (
                                  <TouchableOpacity
                                    key={option[field.optionValue || 'id']}
                                    onPress={() => {
                                      onChange(option[field.optionValue || 'id']);
                                      setOpenSelect(null);
                                    }}
                                    className={`px-4 py-3 border-b border-gray-100 ${
                                      value === option[field.optionValue || 'id'] ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <Text className={`${
                                      value === option[field.optionValue || 'id'] ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                      {option[field.optionLabel || 'nombre']}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>
                      );
                    }}
                  />
                  {field.description && (
                    <Text className="text-gray-500 text-xs mt-1">{field.description}</Text>
                  )}
                  {errors[field.name] && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors[field.name]?.message as string}
                    </Text>
                  )}
                </View>
              ))}

              {/* Display Backend Error */}
              {backendError && (
                <View className="my-3 p-3 bg-red-100 border border-red-300 rounded-lg shadow-sm">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={20} color="#c81e1e" />
                    <Text className="text-red-700 text-sm ml-2 font-medium">Error de Servidor</Text>
                  </View>
                  <Text className="text-red-600 text-sm mt-1 ml-1">{backendError}</Text>
                </View>
              )}

              {/* Tarjeta de switches */}
              {switchFields.length > 0 && (
                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <Text className="text-gray-800 font-medium mb-3">Configuración general</Text>
                  {switchFields.map((field, idx) => (
                    <View key={field.name} className={`flex-row w-full justify-between items-center py-2 ${idx < switchFields.length - 1 ? 'border-b border-gray-300' : ''}`}>
                      <View className="w-3/4">
                        <Text className="text-gray-700 font-medium">{field.label}</Text>
                        {field.description && (
                          <Text className="text-gray-500 text-xs">{field.description}</Text>
                        )}
                      </View>
                      <Controller
                        control={control}
                        name={field.name}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            value={value}
                            onValueChange={onChange}
                            trackColor={{ false: '#d1d5db', true: switchActiveColor }}
                            thumbColor={value ? switchInactiveColor : '#f4f3f4'}
                          />
                        )}
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Botones dentro del ScrollView */}
              <View className="bg-white border-t border-gray-100 pt-6 pb-6 px-0 mt-4">
                <View className="flex-row">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                    onPress={onClose}
                  >
                    <Ionicons name="close-outline" size={18} color="#4b5563" />
                    <Text className="text-gray-800 font-medium ml-2">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: buttonColor }}
                    className={`flex-1 py-3 rounded-lg ml-2 flex-row justify-center items-center`}
                    onPress={handleSubmit(onSubmit)}
                  >
                    <Ionicons name="save-outline" size={18} color={buttonTextColor} />
                    <Text style={{ color: buttonTextColor }} className="font-medium ml-2">
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default DynamicFormModal; 