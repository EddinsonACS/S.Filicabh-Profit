import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'switch' | 'select' | 'date';
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
}

interface FormCompleteProcessProps {
  backendError?: string | null;
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem: any;
  handleCreate: (data: any) => Promise<boolean>;
  handleUpdate: (data: any) => Promise<boolean>;
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

// Function to convert form field values to their appropriate types for submission
const convertValueForSubmission = (fieldName: string, fieldType: string, value: string | number): string | number => {
  // If it's undefined, null or empty string, return 0 for numeric fields
  if (fieldType === 'number' && (value === undefined || value === null || value === '')) {
    return 0;
  }
  
  if (typeof value === 'string' && fieldType === 'number') {
    // Clean the string: remove spaces and replace comma with dot
    const cleanedValue = value.trim().replace(',', '.');
    
    // Special case for 'cantidad' field - force integer
    if (fieldName === 'cantidad') {
      const numericValue = parseInt(cleanedValue, 10);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    
    // All other numeric fields allow decimals
    const numericValue = parseFloat(cleanedValue);
    return isNaN(numericValue) ? 0 : numericValue;
  }
  
  return value;
};


// Formatting functions (copied from DynamicFormModal)
const formatName = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
  
  // Permitir coma o punto al final para continuar escribiendo decimales
  if (cleaned.endsWith('.') || cleaned.endsWith(',')) {
    return cleaned;
  }
  
  // Si hay coma, verificar que solo hay una
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }
    return cleaned;
  }
  
  // Si hay punto, verificar que solo hay uno
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
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

const formatDate = (text: string): string => {
  // Permitir solo números y guiones para formato YYYY-MM-DD
  let cleaned = text.replace(/[^0-9-]/g, '');
  
  // Agregar guiones automáticamente
  if (cleaned.length >= 4 && cleaned.indexOf('-') === -1) {
    cleaned = cleaned.substring(0, 4) + '-' + cleaned.substring(4);
  }
  if (cleaned.length >= 7 && cleaned.lastIndexOf('-') === 4) {
    cleaned = cleaned.substring(0, 7) + '-' + cleaned.substring(7);
  }
  
  // Limitar a 10 caracteres (YYYY-MM-DD)
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }
  
  return cleaned;
};

const getFormattedValue = (fieldName: string, text: string): string => {
  // Campos que deben formatear nombres (cada palabra con mayúscula)
  if (['nombre', 'nombreEjecutivo', 'sucursal', 'personaContacto'].includes(fieldName)) {
    return formatName(text);
  }
  
  // Campos que deben ser solo números enteros
  if (['nroCuenta', 'telefono', 'dias', 'nit', 'codigoRegion', 'codigoTipoVendedor', 'codigoListaPrecio', 'codigoMoneda', 'codigoPais', 'codigoCiudad', 'codigoRubro', 'codigoSector', 'codigoVendedor', 'codigoAcuerdoDePago', 'codigoTipoPersona', 'codigoFiguraComercialCasaMatriz'].includes(fieldName)) {
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
  
  // Campos de números decimales (tasas, montos, medidas)
  if (['tasaVenta', 'tasaCompra', 'montolimiteCreditoVentas', 'montolimiteCreditoCompras', 'peso', 'volumen', 'metroCubico', 'pie', 'precio', 'costo', 'margen'].includes(fieldName)) {
    return formatDecimalNumber(text);
  }
  
  return text;
};

const getFormattedValueByType = (fieldName: string, fieldType: string, text: string): string => {
  // Campo fecha específico - no formatear porque usa date picker
  if (fieldType === 'date') {
    return text;
  }
  
  // Campo porcentaje específico (tiene límite de 100)
  if (fieldName === 'porceRetencionIva') {
    return formatPercentage(text);
  }
  
  // Si es un campo de tipo número y no está en la lista de enteros, usar formateo decimal
  if (fieldType === 'number' && !['nroCuenta', 'telefono', 'dias', 'nit'].includes(fieldName)) {
    return formatDecimalNumber(text);
  }
  
  // Para campos enteros específicos
  if (['nroCuenta', 'telefono', 'dias', 'nit'].includes(fieldName)) {
    return formatInteger(text);
  }
  
  // Usar formateo específico por nombre de campo para otros casos
  return getFormattedValue(fieldName, text);
};

const getKeyboardType = (fieldName: string, fieldType: string) => {
  if (fieldType === 'number' || ['nroCuenta', 'telefono', 'dias', 'nit', 'codigo', 'codigoRegion', 'codigoTipoVendedor', 'codigoListaPrecio', 'codigoMoneda', 'codigoPais', 'codigoCiudad', 'codigoRubro', 'codigoSector', 'codigoVendedor', 'codigoAcuerdoDePago', 'codigoTipoPersona', 'codigoFiguraComercialCasaMatriz'].includes(fieldName)) {
    return 'numeric';
  }
  if (fieldType === 'email') {
    return 'email-address';
  }
  return 'default';
};

const FormCompleteProcess: React.FC<FormCompleteProcessProps> = ({
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
  const [activeTab, setActiveTab] = useState('articulo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{[key: string]: boolean}>({});
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  
  // Helper function to handle select field press
  const handleSelectPress = (fieldName: string) => {
    setOpenSelect(openSelect === fieldName ? null : fieldName);
  };

  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      // Only activate when touch starts near the top of the modal
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < 50; // Only activate if touch starts in top 50px
      },
      // Only activate for downward swipes that start near the top
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && gestureState.y0 < 50;
      },
      // Handle the movement
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) { // Only allow downward movement
          slideAnim.setValue(gestureState.dy);
        }
      },
      // Handle when the user releases the touch
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) { // If swiped down far enough, close the modal
          handleClose();
        } else {
          // Otherwise, animate back to the original position
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      ...currentItem,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        ...defaultValues,
        ...currentItem,
      });
      // Remove the sliding up animation
      slideAnim.setValue(0);
    }
  }, [visible, currentItem]);

  const handleClose = () => {
    // Skip animation when closing to match the new behavior
    onClose();
    reset();
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    let success = false;
    
    try {
      if (isEditing) {
        success = await handleUpdate(data);
      } else {
        success = await handleCreate(data);
      }
      
      if (success) {
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separar campos por tipo
  const textFields = formFields.filter(f => f.type === 'text' || f.type === 'number');
  const dateFields = formFields.filter(f => f.type === 'date');
  const switchFields = formFields.filter(f => f.type === 'switch');
  const selectFields = formFields.filter(f => f.type === 'select');

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: height * 0.9,
          }}
          className="bg-white rounded-t-3xl overflow-hidden"
          // Add panResponder to handle touch events
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View 
            className="py-4 px-4 border-b"
            style={{ backgroundColor: headerColor }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text 
                className="text-lg font-semibold"
                style={{ color: headerTextColor }}
              >
                {isEditing ? 'Editar' : 'Nuevo'} {categoryTitles[selectedCategory] || 'Registro'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={headerTextColor} />
              </TouchableOpacity>
            </View>
            
            {/* Tabs */}
            <View className="flex-row mt-4">
              <TouchableOpacity
                className={`pb-2 px-2 border-b-2 ${activeTab === 'articulo' ? 'border-blue-500' : 'border-transparent'}`}
                onPress={() => setActiveTab('articulo')}
              >
                <Text 
                  className={`font-medium ${activeTab === 'articulo' ? 'text-white' : 'text-white'}`}
                >
                  Artículo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`pb-2 px-2 border-b-2 ${activeTab === 'detalles' ? 'border-blue-500' : 'border-transparent'}`}
                onPress={() => setActiveTab('detalles')}
              >
                <Text 
                  className={`font-medium ${activeTab === 'detalles' ? 'text-white' : 'text-white'}`}
                >
                  Detalles Adicionales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`pb-2 px-2 border-b-2 ${activeTab === 'adicional' ? 'border-blue-500' : 'border-transparent'}`}
                onPress={() => setActiveTab('adicional')}
              >
                <Text 
                  className={`font-medium ${activeTab === 'adicional' ? 'text-white' : 'text-white'}`}
                >
                  Información
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView 
              className="p-6"
              keyboardShouldPersistTaps="handled"
            >
              {activeTab === 'articulo' && (
                <>
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
                              const formattedText = getFormattedValueByType(field.name, field.type, text);
                              onChange(formattedText);
                            }}
                            onBlur={() => {
                              // Convertir a número cuando el usuario termine de escribir
                              if (field.type === 'number') {
                                const currentValue = watch(field.name);
                                const convertedValue = convertValueForSubmission(field.name, field.type, currentValue);
                                onChange(convertedValue);
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

                  {/* Campos de fecha */}
                  {dateFields.map((field) => (
                    <View key={field.name} className="mb-4">
                      <View className="flex-row mb-1">
                        <Text className="text-sm font-medium text-gray-700">{field.label}</Text>
                        {field.required && <Text className="text-red-600">*</Text>}
                      </View>
                      <Controller
                        control={control}
                        name={field.name}
                        render={({ field: { onChange, value } }) => (
                          <View>
                            <TouchableOpacity
                              onPress={() => setShowDatePicker(prev => ({ ...prev, [field.name]: true }))}
                              className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${
                                errors[field.name] ? 'border-red-500' : 'border-gray-200'
                              }`}
                            >
                              <Text className="text-gray-700">
                                {value ? new Date(value).toLocaleDateString('es-ES') : field.placeholder}
                              </Text>
                              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            </TouchableOpacity>
                            
                            {showDatePicker[field.name] && (
                              <DateTimePicker
                                value={value ? new Date(value) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event: any, selectedDate: Date | undefined) => {
                                  setShowDatePicker(prev => ({ ...prev, [field.name]: false }));
                                  if (selectedDate) {
                                    // Formatear la fecha como YYYY-MM-DD
                                    const formattedDate = selectedDate.toISOString().split('T')[0];
                                    onChange(formattedDate);
                                  }
                                }}
                              />
                            )}
                          </View>
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
                            opt => String(opt[field.optionValue || 'id']) === String(value)
                          );
                          
                          return (
                            <View>
                              <TouchableOpacity
                                onPress={() => handleSelectPress(field.name)}
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
                                  <ScrollView
                                    nestedScrollEnabled={true}
                                    className="max-h-48">
                                    {field.options?.map((option) => (
                                      <TouchableOpacity
                                        key={String(option[field.optionValue || 'id'])}
                                        onPress={() => {
                                          onChange(option[field.optionValue || 'id']);
                                          setOpenSelect(null);
                                        }}
                                        className={`px-4 py-3 border-b border-gray-100 ${
                                          String(value) === String(option[field.optionValue || 'id']) ? 'bg-blue-50' : ''
                                        }`}
                                      >
                                        <Text className={`${
                                          String(value) === String(option[field.optionValue || 'id']) ? 'text-blue-600' : 'text-gray-700'
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
                                trackColor={{ false: switchInactiveColor, true: switchActiveColor }}
                              />
                            )}
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  {backendError && (
                    <View className="my-3 p-3 bg-red-100 border border-red-300 rounded-lg shadow-sm">
                      <View className="flex-row items-center">
                        <Ionicons name="alert-circle-outline" size={20} color="#c81e1e" />
                        <Text className="text-red-700 text-sm ml-2 font-medium">Error de Servidor</Text>
                      </View>
                      <Text className="text-red-600 text-sm mt-1 ml-1">{backendError}</Text>
                    </View>
                  )}
                </>
              )}
              
              {activeTab === 'detalles' && (
                <View className="py-8 items-center justify-center">
                  <Ionicons name="images-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Sección de Detalles Adicionales</Text>
                  <Text className="text-gray-400 text-sm mt-1">Contenido pendiente por implementar</Text>
                </View>
              )}
              
              {activeTab === 'adicional' && (
                <View className="py-8 items-center justify-center">
                  <Ionicons name="information-circle-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Información Adicional</Text>
                  <Text className="text-gray-400 text-sm mt-1">Contenido pendiente por implementar</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View className="p-4 border-t border-gray-200 flex-row justify-end space-x-3">
              <TouchableOpacity
                className="px-4 py-2 rounded-md border border-gray-300"
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text className="text-gray-700 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-md ${isSubmitting ? 'opacity-70' : ''}`}
                style={{ backgroundColor: buttonColor }}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                <Text style={{ color: buttonTextColor }} className="font-medium">
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FormCompleteProcess;