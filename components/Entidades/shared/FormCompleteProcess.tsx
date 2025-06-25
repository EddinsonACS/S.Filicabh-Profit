import { useArticuloFoto } from '@/hooks/Inventario/useArticuloFoto';
import { useArticuloListaDePrecio } from '@/hooks/Inventario/useArticuloListaDePrecio';
import { useArticuloUbicacion } from '@/hooks/Inventario/useArticuloUbicacion';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  articuloId?: number;
  almacenes?: any[];
  monedas?: any[];
  listasPrecio?: any[];
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
  backendError,
  articuloId,
  almacenes = [],
  monedas = [],
  listasPrecio = []
}) => {
  const [activeTab, setActiveTab] = useState('articulo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  // Estados para manejar fotos
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [principalImageIndex, setPrincipalImageIndex] = useState(0);

  // Estados para manejar listas de precio
  const [listasPrecios, setListasPrecios] = useState<any[]>([{
    id: Date.now(),
    codigoListasdePrecio: '',
    codigoMoneda: '',
    monto: 0,
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: '',
    suspendido: false
  }]);

  // Estados para manejar ubicaciones
  const [ubicaciones, setUbicaciones] = useState<any[]>([{
    id: Date.now() + 1,
    codigoAlmacen: '',
    ubicacion: '',
    otrosC1: '',
    otrosC2: '',
    otrosN1: 0,
    otrosN2: 0
  }]);

  // Estados para expandir/contraer secciones
  const [expandedSections, setExpandedSections] = useState({
    listaPrecio: false,
    ubicaciones: false
  });

  // Hooks para los pasos adicionales
  const { useCreateArticuloFoto, useUpdateArticuloFoto, useDeleteArticuloFoto } = useArticuloFoto();
  const { useCreateArticuloListaDePrecio, useUpdateArticuloListaDePrecio, useDeleteArticuloListaDePrecio } = useArticuloListaDePrecio();
  const { useCreateArticuloUbicacion, useUpdateArticuloUbicacion, useDeleteArticuloUbicacion } = useArticuloUbicacion();

  const createFotoMutation = useCreateArticuloFoto();
  const updateFotoMutation = useUpdateArticuloFoto();
  const deleteFotoMutation = useDeleteArticuloFoto();

  const createPrecioMutation = useCreateArticuloListaDePrecio();
  const updatePrecioMutation = useUpdateArticuloListaDePrecio();
  const deletePrecioMutation = useDeleteArticuloListaDePrecio();

  const createUbicacionMutation = useCreateArticuloUbicacion();
  const updateUbicacionMutation = useUpdateArticuloUbicacion();
  const deleteUbicacionMutation = useDeleteArticuloUbicacion();

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

  // Función para manejar selección de imagen
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImage = {
        id: Date.now(),
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        type: result.assets[0].type || 'image/jpeg',
        file: result.assets[0]
      };
      setSelectedImages(prev => [...prev, newImage]);
    }
  };

  // Función para eliminar imagen
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (principalImageIndex === index) {
      setPrincipalImageIndex(0);
    } else if (principalImageIndex > index) {
      setPrincipalImageIndex(prev => prev - 1);
    }
  };

  // Función para actualizar lista de precio
  const updateListaPrecio = (index: number, field: string, value: any) => {
    setListasPrecios(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Función para actualizar ubicación
  const updateUbicacion = (index: number, field: string, value: any) => {
    setUbicaciones(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Función para guardar fotos
  const saveFotos = async () => {
    if (!articuloId || selectedImages.length === 0) return true;

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const fotoData = {
          CodigoArticulo: articuloId,
          ImageFile: image.file,
          EsPrincipal: i === principalImageIndex,
          Orden: i + 1
        };
        await createFotoMutation.mutateAsync(fotoData);
      }
      return true;
    } catch (error) {
      console.error('Error saving fotos:', error);
      return false;
    }
  };

  // Función para guardar listas de precio
  const saveListasPrecios = async () => {
    if (!articuloId || listasPrecios.length === 0) return true;

    try {
      for (const precio of listasPrecios) {
        if (precio.codigoListasdePrecio && precio.codigoMoneda && precio.monto > 0) {
          const precioData = {
            codigoArticulo: articuloId,
            codigoListasdePrecio: Number(precio.codigoListasdePrecio),
            codigoMoneda: Number(precio.codigoMoneda),
            monto: Number(precio.monto),
            fechaDesde: precio.fechaDesde,
            fechaHasta: precio.fechaHasta || '',
            suspendido: precio.suspendido
          };
          await createPrecioMutation.mutateAsync(precioData);
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving precios:', error);
      return false;
    }
  };

  // Función para guardar ubicaciones
  const saveUbicaciones = async () => {
    if (!articuloId || ubicaciones.length === 0) return true;

    try {
      for (const ubicacion of ubicaciones) {
        if (ubicacion.codigoAlmacen && ubicacion.ubicacion) {
          const ubicacionData = {
            codigoArticulo: articuloId,
            codigoAlmacen: Number(ubicacion.codigoAlmacen),
            ubicacion: ubicacion.ubicacion,
            otrosC1: ubicacion.otrosC1 || '',
            otrosC2: ubicacion.otrosC2 || '',
            otrosN1: Number(ubicacion.otrosN1) || 0,
            otrosN2: Number(ubicacion.otrosN2) || 0
          };
          await createUbicacionMutation.mutateAsync(ubicacionData);
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving ubicaciones:', error);
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let success = false;

    try {
      // Paso 1: Artículo
      if (activeTab === 'articulo') {
        if (!isEditing) {
          // Si es nuevo artículo, guardar y obtener ID
          success = await handleCreate(data);
        } else {
          // Si es edición, solo pasar al siguiente paso
          success = true;
        }

        if (success) {
          setActiveTab('adicional');
        }
      }
      // Paso 2: Adicional
      else if (activeTab === 'adicional') {
        if (!isEditing) {
          const preciosSuccess = await saveListasPrecios();
          const ubicacionesSuccess = await saveUbicaciones();
          success = preciosSuccess && ubicacionesSuccess;
        } else {
          success = true;
        }

        if (success) {
          setActiveTab('detalles');
        }
      }
      // Paso 3: Detalles y guardado final
      else if (activeTab === 'detalles') {
        if (isEditing) {
          // En modo edición, guardar todo al final
          success = await handleUpdate(data);
          if (success) {
            const preciosSuccess = await saveListasPrecios();
            const ubicacionesSuccess = await saveUbicaciones();
            const fotosSuccess = await saveFotos();
            success = preciosSuccess && ubicacionesSuccess && fotosSuccess;
          }
        } else {
          success = await saveFotos();
        }

        if (success) {
          handleClose();
        }
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

  // Función para alternar sección expandida
  const toggleSection = (section: 'listaPrecio' | 'ubicaciones') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        >
          {/* Header */}
          <View
            className="p-4 rounded-xl"
            style={{ backgroundColor: headerColor }}
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <View className="items-center mt-4 mb-3">
              <Text
                className="text-xl text-center font-bold"
                style={{ color: headerTextColor }}
              >
                {isEditing ? 'Editar' : 'Nuevo'} {categoryTitles[selectedCategory] || 'Registro'}
              </Text>
            </View>

            {/* Progress Stepper */}
            <View className="px-6 mb-2">
              <View className="relative">
                {/* Puntos y textos horizontales */}
                <View className="flex-row items-center justify-between">
                  {/* Paso 1 - Artículo */}
                  <TouchableOpacity
                    onPress={() => setActiveTab('articulo')}
                    className="flex-row items-center py-2"
                  >
                    <View className={`w-3 h-3 rounded-full ${activeTab === 'articulo' || activeTab === 'adicional' || activeTab === 'detalles'
                      ? 'bg-white'
                      : 'bg-white/30'
                      }`} />
                    <Text className={`ml-2 text-xs ${activeTab === 'articulo'
                      ? 'text-white font-medium'
                      : 'text-white/70'
                      }`}>
                      Artículo
                    </Text>
                  </TouchableOpacity>

                  {/* Separador invisible para espaciado */}
                  <View className="flex-1" />

                  {/* Paso 2 - Inf. Adicional */}
                  <TouchableOpacity
                    onPress={() => setActiveTab('adicional')}
                    className="flex-row items-center py-2"
                  >
                    <View className={`w-3 h-3 rounded-full ${activeTab === 'adicional' || activeTab === 'detalles'
                      ? 'bg-white'
                      : 'bg-white/30'
                      }`} />
                    <Text className={`ml-2 text-xs ${activeTab === 'adicional'
                      ? 'text-white font-medium'
                      : 'text-white/70'
                      }`}>
                      Inf. Adicional
                    </Text>
                  </TouchableOpacity>

                  {/* Separador invisible para espaciado */}
                  <View className="flex-1" />

                  {/* Paso 3 - Foto */}
                  <TouchableOpacity
                    onPress={() => setActiveTab('detalles')}
                    className="flex-row items-center py-2"
                  >
                    <View className={`w-3 h-3 rounded-full ${activeTab === 'detalles'
                      ? 'bg-white'
                      : 'bg-white/30'
                      }`} />
                    <Text className={`ml-2 text-xs ${activeTab === 'detalles'
                      ? 'text-white font-medium'
                      : 'text-white/70'
                      }`}>
                      Foto
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Líneas de progreso por debajo */}
                <View className="absolute bottom-0 left-0 right-0 flex-row items-center">
                  {/* Línea de fondo completa */}
                  <View className="flex-1 h-0.5 bg-white/20 mx-4" />

                  {/* Líneas de progreso activas */}
                  <View className="absolute left-4 right-4 flex-row">
                    {/* Línea 1-2 */}
                    <View className={`flex-1 h-0.5 ${activeTab === 'adicional' || activeTab === 'detalles' ? 'bg-white' : 'bg-transparent'
                      }`} />
                    {/* Línea 2-3 */}
                    <View className={`flex-1 h-0.5 ${activeTab === 'detalles' ? 'bg-white' : 'bg-transparent'
                      }`} />
                  </View>
                </View>
              </View>
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
                            className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${errors[field.name] ? 'border-red-500' : 'border-gray-200'
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
                              className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${errors[field.name] ? 'border-red-500' : 'border-gray-200'
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
                                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${errors[field.name] ? 'border-red-500' : 'border-gray-200'
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
                                        className={`px-4 py-3 border-b border-gray-100 ${String(value) === String(option[field.optionValue || 'id']) ? 'bg-blue-50' : ''
                                          }`}
                                      >
                                        <Text className={`${String(value) === String(option[field.optionValue || 'id']) ? 'text-blue-600' : 'text-gray-700'
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

              {activeTab === 'adicional' && (
                <>
                  {/* Sección de Lista de Precio */}
                  <View className="mb-4">
                    <TouchableOpacity
                      onPress={() => toggleSection('listaPrecio')}
                      className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <Text className="text-md font-semibold text-gray-800">Lista de Precio</Text>
                      <Ionicons
                        name={expandedSections.listaPrecio ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {expandedSections.listaPrecio && (
                      <View className="mt-2">
                        {listasPrecios.map((precio, index) => (
                          <View key={precio.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                            <View className="space-y-3">
                              {/* Lista de Precio */}
                              <View>
                                <View className="relative">
                                  <TouchableOpacity
                                    onPress={() => setOpenSelect(`listaPrecio_${index}`)}
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                  >
                                    <Text className="text-gray-700">
                                      {precio.codigoListasdePrecio ?
                                        listasPrecio.find(l => l.id === Number(precio.codigoListasdePrecio))?.nombre || 'Seleccione' :
                                        'Seleccione una lista'
                                      }
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                  </TouchableOpacity>

                                  {openSelect === `listaPrecio_${index}` && (
                                    <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                                      <ScrollView className="max-h-32">
                                        {listasPrecio.map((lista) => (
                                          <TouchableOpacity
                                            key={lista.id}
                                            onPress={() => {
                                              updateListaPrecio(index, 'codigoListasdePrecio', lista.id);
                                              setOpenSelect(null);
                                            }}
                                            className="px-4 py-3 border-b border-gray-100"
                                          >
                                            <Text className="text-gray-700">{lista.nombre}</Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                    </View>
                                  )}
                                </View>
                              </View>

                              {/* Moneda */}
                              <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Moneda</Text>
                                <View className="relative">
                                  <TouchableOpacity
                                    onPress={() => setOpenSelect(`moneda_${index}`)}
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                  >
                                    <Text className="text-gray-700">
                                      {precio.codigoMoneda ?
                                        monedas.find(m => m.id === Number(precio.codigoMoneda))?.nombre || 'Seleccione' :
                                        'Seleccione una moneda'
                                      }
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                  </TouchableOpacity>

                                  {openSelect === `moneda_${index}` && (
                                    <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                                      <ScrollView className="max-h-32">
                                        {monedas.map((moneda) => (
                                          <TouchableOpacity
                                            key={moneda.id}
                                            onPress={() => {
                                              updateListaPrecio(index, 'codigoMoneda', moneda.id);
                                              setOpenSelect(null);
                                            }}
                                            className="px-4 py-3 border-b border-gray-100"
                                          >
                                            <Text className="text-gray-700">{moneda.nombre}</Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                    </View>
                                  )}
                                </View>
                              </View>

                              {/* Monto */}
                              <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Monto</Text>
                                <TextInput
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                  placeholder="0.00"
                                  value={String(precio.monto)}
                                  onChangeText={(text) => updateListaPrecio(index, 'monto', text)}
                                  keyboardType="numeric"
                                />
                              </View>

                              {/* Fechas */}
                              <View className="flex-row space-x-3">
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Fecha Desde</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="YYYY-MM-DD"
                                    value={precio.fechaDesde}
                                    onChangeText={(text) => updateListaPrecio(index, 'fechaDesde', text)}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Fecha Hasta</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="YYYY-MM-DD (opcional)"
                                    value={precio.fechaHasta}
                                    onChangeText={(text) => updateListaPrecio(index, 'fechaHasta', text)}
                                  />
                                </View>
                              </View>

                              {/* Switch Suspendido */}
                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-medium text-gray-700">Suspendido</Text>
                                <Switch
                                  value={precio.suspendido}
                                  onValueChange={(value) => updateListaPrecio(index, 'suspendido', value)}
                                  trackColor={{ false: switchInactiveColor, true: switchActiveColor }}
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Sección de Ubicacion */}
                  <View className="mb-2">
                    <TouchableOpacity
                      onPress={() => toggleSection('ubicaciones')}
                      className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <Text className="text-md font-semibold text-gray-800">Ubicación</Text>
                      <Ionicons
                        name={expandedSections.ubicaciones ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {expandedSections.ubicaciones && (
                      <View className="mt-2">
                        {ubicaciones.map((ubicacion, index) => (
                          <View key={ubicacion.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                            <View className="space-y-3">
                              {/* Almacén */}
                              <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Almacén</Text>
                                <View className="relative">
                                  <TouchableOpacity
                                    onPress={() => setOpenSelect(`almacen_${index}`)}
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                  >
                                    <Text className="text-gray-700">
                                      {ubicacion.codigoAlmacen ?
                                        almacenes.find(a => a.id === Number(ubicacion.codigoAlmacen))?.nombre || 'Seleccione' :
                                        'Seleccione un almacén'
                                      }
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                  </TouchableOpacity>

                                  {openSelect === `almacen_${index}` && (
                                    <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                                      <ScrollView className="max-h-32">
                                        {almacenes.map((almacen) => (
                                          <TouchableOpacity
                                            key={almacen.id}
                                            onPress={() => {
                                              updateUbicacion(index, 'codigoAlmacen', almacen.id);
                                              setOpenSelect(null);
                                            }}
                                            className="px-4 py-3 border-b border-gray-100"
                                          >
                                            <Text className="text-gray-700">{almacen.nombre}</Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                    </View>
                                  )}
                                </View>
                              </View>

                              {/* Ubicación */}
                              <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Ubicación Específica</Text>
                                <TextInput
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                  placeholder="Ej: Pasillo A, Estante 3, Nivel 2"
                                  value={ubicacion.ubicacion}
                                  onChangeText={(text) => updateUbicacion(index, 'ubicacion', text)}
                                />
                              </View>

                              {/* Campos adicionales */}
                              <View className="flex-row space-x-3">
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Descripción 1</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="Información adicional"
                                    value={ubicacion.otrosC1}
                                    onChangeText={(text) => updateUbicacion(index, 'otrosC1', text)}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Descripción 2</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="Información adicional"
                                    value={ubicacion.otrosC2}
                                    onChangeText={(text) => updateUbicacion(index, 'otrosC2', text)}
                                  />
                                </View>
                              </View>

                              <View className="flex-row space-x-3">
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Cantidad Mínima</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="0"
                                    value={String(ubicacion.otrosN1)}
                                    onChangeText={(text) => updateUbicacion(index, 'otrosN1', text)}
                                    keyboardType="numeric"
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm font-medium text-gray-700 mb-1">Cantidad Máxima</Text>
                                  <TextInput
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    placeholder="0"
                                    value={String(ubicacion.otrosN2)}
                                    onChangeText={(text) => updateUbicacion(index, 'otrosN2', text)}
                                    keyboardType="numeric"
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              )}

              {activeTab === 'detalles' && (
                <>
                  {/* Sección de Fotos */}
                  <View className="mb-6">
                    {selectedImages.length === 0 ? (
                      <>
                        {/* Vista cuando no hay fotos - botón completo */}
                        <TouchableOpacity
                          onPress={pickImage}
                          className="w-full py-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
                        >
                          <Ionicons name="camera-outline" size={48} color="#6B7280" />
                          <Text className="text-gray-600 font-medium mt-3">Agregar Foto</Text>
                          <Text className="text-gray-500 text-sm mt-1">Toca para seleccionar una imagen</Text>
                        </TouchableOpacity>

                        {/* Mensaje cuando no hay imágenes */}
                        <View className="p-4 bg-gray-50 rounded-lg">
                          <Text className="text-gray-500 text-center text-sm">
                            No hay fotos seleccionadas. Toca el botón superior para agregar la primera imagen.
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Vista grid cuando hay fotos */}
                        <View className="flex-row flex-wrap">
                          {/* Botón para agregar foto - siempre en primera posición */}
                          <View className="w-[32%] mb-4 mr-[2%]">
                            <TouchableOpacity
                              onPress={pickImage}
                              className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                            >
                              <Ionicons name="camera-outline" size={24} color="#6B7280" />
                              <Text className="text-gray-500 text-xs mt-1 text-center">Agregar{'\n'}Foto</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Grid de imágenes existentes */}
                          {selectedImages.map((image, index) => (
                            <View key={image.id} className={`w-[32%] mb-4 ${(index + 1) % 3 !== 0 ? 'mr-[2%]' : ''}`}>
                              <View className="relative">
                                <Image
                                  source={{ uri: image.uri }}
                                  style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                                  contentFit="cover"
                                />

                                {/* Overlay con controles */}
                                <View className="absolute inset-0 bg-black/40 rounded-lg opacity-0 active:opacity-100">
                                  <View className="flex-1 justify-between p-2">
                                    {/* Botón eliminar */}
                                    <TouchableOpacity
                                      onPress={() => removeImage(index)}
                                      className="self-end p-1 bg-red-500 rounded-full"
                                    >
                                      <Ionicons name="close" size={12} color="white" />
                                    </TouchableOpacity>

                                    {/* Botón marcar como principal */}
                                    <TouchableOpacity
                                      onPress={() => setPrincipalImageIndex(index)}
                                      className="self-center p-1 bg-white/90 rounded-full"
                                    >
                                      <Ionicons
                                        name={principalImageIndex === index ? "star" : "star-outline"}
                                        size={16}
                                        color={principalImageIndex === index ? "#F59E0B" : "#6B7280"}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                {/* Indicador de imagen principal */}
                                {principalImageIndex === index && (
                                  <View className="absolute top-1 left-1 bg-yellow-500 rounded-full p-1">
                                    <Ionicons name="star" size={12} color="white" />
                                  </View>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View className="bg-white border-t border-gray-200 py-2 px-6 shadow-lg mb-4">
              <View className="flex-row">
                {/* Botón Anterior/Cancelar */}
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                  onPress={() => {
                    if (activeTab === 'articulo') {
                      handleClose();
                    } else if (activeTab === 'adicional') {
                      setActiveTab('articulo');
                    } else if (activeTab === 'detalles') {
                      setActiveTab('adicional');
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name={activeTab === 'articulo' ? "close-outline" : "arrow-back-outline"}
                    size={18}
                    color="#4b5563"
                  />
                  <Text className="text-gray-800 font-medium ml-2">
                    {activeTab === 'articulo' ? 'Cancelar' : 'Anterior'}
                  </Text>
                </TouchableOpacity>

                {/* Botón Siguiente/Guardar */}
                <TouchableOpacity
                  style={{ backgroundColor: buttonColor }}
                  className={`flex-1 py-3 rounded-lg ml-2 flex-row justify-center items-center ${isSubmitting ? 'opacity-70' : ''}`}
                  onPress={() => {
                    if (activeTab === 'articulo') {
                      handleSubmit(onSubmit)();
                    } else if (activeTab === 'adicional') {
                      onSubmit({});
                    } else if (activeTab === 'detalles') {
                      onSubmit({});
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name={activeTab === 'detalles' ? "save-outline" : "arrow-forward-outline"}
                    size={18}
                    color={buttonTextColor}
                  />
                  <Text style={{ color: buttonTextColor }} className="font-medium ml-2">
                    {isSubmitting ? 'Procesando...' : (
                      activeTab === 'articulo' ? (
                        isEditing && currentItem ? 'Siguiente' : 'Siguiente'
                      ) :
                        activeTab === 'adicional' ? 'Siguiente' :
                          'Finalizar'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FormCompleteProcess;