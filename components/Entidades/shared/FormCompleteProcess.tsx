import { useAlmacen } from '@/hooks/Inventario/useAlmacen';
import { useArticuloFoto } from '@/hooks/Inventario/useArticuloFoto';
import { useArticuloListaDePrecio } from '@/hooks/Inventario/useArticuloListaDePrecio';
import { useArticuloUbicacion } from '@/hooks/Inventario/useArticuloUbicacion';
import { useListaDePrecio } from '@/hooks/Ventas/useListaDePrecio';
import { useMoneda } from '@/hooks/Ventas/useMoneda';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

interface ListaPrecioItem {
  id: number;
  codigoListasdePrecio: string;
  codigoMoneda: string;
  monto: string | number;
  fechaDesde: string;
  fechaHasta: string;
  suspendido: boolean;
}

interface PrecioInputs {
  monto: string;
  fechaDesde: string;
  fechaHasta: string;
}

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

interface ArticleResponse {
  id: number;
  // Add other article properties as needed
  [key: string]: any;
}

interface FormCompleteProcessProps {
  backendError?: string | null;
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem: any;
  handleCreate: (data: any) => Promise<boolean | ArticleResponse>;
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
    .join(' ');
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
  if (['nroCuenta', 'telefono', 'dias', 'nit', 'idRegion', 'codigoTipoVendedor', 'idListaPrecio', 'codigoMoneda', 'idPais', 'idCiudad', 'idRubro', 'idSector', 'idVendedor', 'idAcuerdoDePago', 'idTipoPersona', 'codigoFiguraComercialCasaMatriz'].includes(fieldName)) {
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
  if (fieldType === 'number' || ['nroCuenta', 'telefono', 'dias', 'nit', 'codigo', 'idRegion', 'codigoTipoVendedor', 'idListaPrecio', 'codigoMoneda', 'idPais', 'idCiudad', 'idRubro', 'idSector', 'idVendedor', 'idAcuerdoDePago', 'idTipoPersona', 'codigoFiguraComercialCasaMatriz'].includes(fieldName)) {
    return 'numeric';
  }
  if (fieldType === 'email') {
    return 'email-address';
  }
  return 'default';
};

interface FormData {
  [key: string]: any;
}

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
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [principalImageIndex, setPrincipalImageIndex] = useState<number>(-1);
  const [listasPrecios, setListasPrecios] = useState<ListaPrecioItem[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<string>('');
  const [selectedMoneda, setSelectedMoneda] = useState<string>('');
  const [showListaPrecioSection, setShowListaPrecioSection] = useState(true);
  const [showUbicacionesSection, setShowUbicacionesSection] = useState(true);
  const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>('');
  const [ubicacionInput, setUbicacionInput] = useState<string>('');
  const [precioInputs, setPrecioInputs] = useState<PrecioInputs>({
    monto: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Estados para manejar fotos
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const {useGetListaDePrecioList} = useListaDePrecio();
  const {data: listasPreciosData} = useGetListaDePrecioList(1,100);
  
  const insets = useSafeAreaInsets();
  
  // Function to add a new price to the list
  const addListaPrecio = () => {
    if (precioInputs.monto && precioInputs.fechaDesde && selectedListaPrecio && selectedMoneda) {
      const newPrice: ListaPrecioItem = {
        id: Date.now(),
        codigoListasdePrecio: selectedListaPrecio,
        codigoMoneda: selectedMoneda,
        monto: Number(precioInputs.monto) || 0,
        fechaDesde: precioInputs.fechaDesde,
        fechaHasta: precioInputs.fechaHasta || '',
        suspendido: false
      };
      
      setListasPrecios(prev => [...prev, newPrice]);
      
      // Clear the input fields after adding
      setPrecioInputs((prev: PrecioInputs) => ({
        ...prev,
        monto: '',
        fechaHasta: ''
      }));
      setSelectedListaPrecio('');
      setSelectedMoneda('');
    }
  };
  
  // Function to update a price in the list
  const updateListaPrecio = (index: number, field: keyof ListaPrecioItem, value: string | boolean | number) => {
    setListasPrecios(prev => {
      const updated = [...prev];
      if (field === 'monto' && typeof value === 'string') {
        updated[index] = { ...updated[index], [field]: Number(value) || 0 };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };
  
  // Function to remove a price from the list
  const removeListaPrecio = (id: number) => {
    setListasPrecios(prev => prev.filter(item => item.id !== id));
  };

  const {useGetMonedaList} = useMoneda();
  const {data: monedasData} = useGetMonedaList(1, 100);
  
  // Get Almacen data for Ubicaciones
  const {useGetAlmacenList} = useAlmacen();
  const {data: almacenesData} = useGetAlmacenList(1, 100);
  
  // Merge almacenes from props with data from API
  const allAlmacenes = [
    ...(almacenes || []),
    ...(almacenesData?.data?.map(almacen => ({
      id: almacen.id,
      nombre: almacen.nombre
    })) || [])
  ];
  
  // Estados para expandir/contraer secciones
  const [expandedSections, setExpandedSections] = useState({
    listaPrecio: true,
    ubicaciones: true
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing ? currentItem : defaultValues
  });

  useEffect(() => {
    if (isEditing && currentItem) {
      console.log('Reseteando formulario con datos actuales:', currentItem);
      reset(currentItem);
      
      // Inicializar presentaciones si existen
      if (currentItem.presentaciones) {
        const presentacionesArray = Array.isArray(currentItem.presentaciones) 
          ? currentItem.presentaciones 
          : [currentItem.presentaciones];
        setValue('presentaciones', presentacionesArray);
      }
      
      // Inicializar otros campos numéricos
      ['peso', 'volumen', 'metroCubico', 'pie', 'puntoMinimo', 'puntoMaximo'].forEach(field => {
        if (currentItem[field] !== undefined) {
          setValue(field, Number(currentItem[field]));
        }
      });
      
      // Inicializar campos booleanos
      ['manejaLote', 'manejaSerial', 'poseeGarantia', 'manejaPuntoMinimo', 'manejaPuntoMaximo', 'suspendido'].forEach(field => {
        if (currentItem[field] !== undefined) {
          setValue(field, Boolean(currentItem[field]));
        }
      });
    } else {
      reset(defaultValues);
      setSelectedImages([]);
      setPrincipalImageIndex(-1);
      setListasPrecios([]);
      setUbicaciones([]);
      setSelectedListaPrecio('');
      setSelectedMoneda('');
      setCreatedArticleId(null);
    }
  }, [isEditing, currentItem, defaultValues, reset, setValue]);

  const handleClose = () => {
    // Skip animation when closing to match the new behavior
    onClose();
    reset();
  };

  // Función helper para procesar la imagen seleccionada
  const processSelectedImage = (result: any) => {
    if (!result.canceled) {
      const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      let mimeType = 'image/jpeg'; // default
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'gif') {
        mimeType = 'image/gif';
      } else if (fileExtension === 'webp') {
        mimeType = 'image/webp';
      }
      
      const newImage = {
        id: Date.now(),
        uri: result.assets[0].uri,
        name: fileName,
        type: mimeType,
        file: {
          ...result.assets[0],
          type: mimeType
        }
      };
      setSelectedImages(prev => [...prev, newImage]);
    }
  };

  // Función para seleccionar imagen desde la galería
  const pickImageFromGallery = async () => {
    console.log('📱 Abriendo galería...');
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

    console.log('📱 Resultado de galería:', result.canceled ? 'Cancelado' : 'Imagen seleccionada');
    processSelectedImage(result);
    setShowImagePickerModal(false);
  };

  // Función para tomar foto con la cámara
  const takePhotoWithCamera = async () => {
    console.log('📷 Abriendo cámara...');
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('📷 Resultado de cámara:', result.canceled ? 'Cancelado' : 'Foto tomada');
    processSelectedImage(result);
    setShowImagePickerModal(false);
  };

  // Función para mostrar el modal de selección
  const showImagePicker = () => {
    setShowImagePickerModal(true);
  };

  // Función para eliminar imagen
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (principalImageIndex === index) {
      setPrincipalImageIndex(-1);
    } else if (principalImageIndex > index) {
      setPrincipalImageIndex(prev => prev - 1);
    }
  };

  // Función para marcar imagen como favorita
  const setImageAsFavorite = (index: number) => {
    console.log('🎯 setImageAsFavorite llamado con índice:', index);
    console.log('🎯 Estado actual de principalImageIndex:', principalImageIndex);
    console.log('🎯 Total de imágenes:', selectedImages.length);
    
    if (index >= 0 && index < selectedImages.length) {
      setPrincipalImageIndex(index);
      console.log(`⭐ Imagen ${index + 1} marcada como favorita`);
      console.log('🎯 Nuevo principalImageIndex será:', index);
    } else {
      console.log('❌ Índice inválido para setImageAsFavorite:', index);
    }
  };

  // Función para guardar fotos de forma secuencial
  const saveFotos = async (articleId: number) => {
    if (!articleId || selectedImages.length === 0) return true;

    try {
      console.log('📸 Iniciando subida de fotos...');
      console.log('📸 Total de imágenes a subir:', selectedImages.length);
      console.log('📸 Índice de imagen favorita:', principalImageIndex);
      
      // Validar que haya una imagen favorita seleccionada
      if (principalImageIndex < 0 || principalImageIndex >= selectedImages.length) {
        console.log('⚠️ No hay imagen favorita seleccionada, seleccionando la primera por defecto');
        setPrincipalImageIndex(0);
      }
      
      let uploadedCount = 0;
      let failedCount = 0;
      
      // Subir las imágenes de forma secuencial
      for (let index = 0; index < selectedImages.length; index++) {
        const image = selectedImages[index];
        const isPrincipal = index === principalImageIndex;
        
        const file = {
          uri: image.file.uri,
          name: image.file.fileName || image.name || `image_${Date.now()}_${index}.jpg`,
          type: image.type, // Usar el tipo MIME correcto que ya establecimos
        };

        console.log(`📸 Subiendo imagen ${index + 1}/${selectedImages.length}:`, {
          nombre: file.name,
          tipo: file.type,
          esPrincipal: isPrincipal,
          orden: index + 1,
          idArticulo: articleId
        });

        try {
          // Esperar a que cada imagen se suba antes de continuar con la siguiente
          const response = await createFotoMutation.mutateAsync({
            idArticulo: Number(articleId),
            esPrincipal: isPrincipal,
            orden: index + 1,
            equipo: 'equipo',
            imageFile: file
          });
          
          console.log(`✅ Imagen ${index + 1} subida exitosamente${isPrincipal ? ' (FAVORITA)' : ''}`, response);
          uploadedCount++;
          
          // Pequeña pausa entre subidas para evitar sobrecargar el servidor
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          failedCount++;
          console.error(`❌ Error al subir la imagen ${index + 1}:`, {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // Si es la imagen principal la que falló, necesitamos manejar esto
          if (isPrincipal) {
            console.error('⚠️ La imagen principal falló al subirse');
            // Si hay más imágenes, podríamos intentar hacer la siguiente imagen como principal
            if (index < selectedImages.length - 1) {
              setPrincipalImageIndex(index + 1);
            }
          }
          
          continue;
        }
      }
      
      console.log('📊 Resumen de subida de fotos:', {
        total: selectedImages.length,
        exitosas: uploadedCount,
        fallidas: failedCount
      });
      
      // Solo retornamos true si al menos una imagen se subió correctamente
      return uploadedCount > 0;
    } catch (error) {
      console.error('❌ Error inesperado en saveFotos:', error);
      // Relanzar el error para que sea manejado por el componente padre
      throw error;
    }
  };

  // Función para guardar listas de precio
  const saveListasPrecios = async (articleId: number) => {
    if (!articleId || listasPrecios.length === 0) return true;

    try {
      for (const precio of listasPrecios) {
        if (precio.codigoListasdePrecio && precio.codigoMoneda && Number(precio.monto) > 0) {
          const precioData = {
            codigoArticulo: articleId,
            codigoListasdePrecio: Number(precio.codigoListasdePrecio),
            codigoMoneda: Number(precio.codigoMoneda),
            monto: Number(precio.monto),
            fechaDesde: precio.fechaDesde,
            fechaHasta: precio.fechaHasta || '',
            suspendido: Boolean(precio.suspendido)
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
  const saveUbicaciones = async (articleId: number) => {
    if (!articleId || ubicaciones.length === 0) return true;

    try {
      console.log('📍 Iniciando guardado de ubicaciones para artículo:', articleId);
      console.log('📍 Total de ubicaciones a guardar:', ubicaciones.length);
      
      for (const ubicacion of ubicaciones) {
        if (ubicacion.codigoAlmacen && ubicacion.ubicacion) {
          const ubicacionData = {
            idArticulo: Number(articleId),
            idAlmacen: Number(ubicacion.codigoAlmacen),
            ubicacion: ubicacion.ubicacion,
            equipo: 'equipo',
            usuario: 0
          };
          
          console.log('📍 Guardando ubicación:', ubicacionData);
          await createUbicacionMutation.mutateAsync(ubicacionData);
          console.log('✅ Ubicación guardada exitosamente');
        }
      }
      console.log('🎉 Todas las ubicaciones guardadas exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error saving ubicaciones:', error);
      throw error;
    }
  };

  // Función para agregar ubicación
  const addUbicacion = () => {
    if (!selectedAlmacen || !ubicacionInput) return;

    setUbicaciones(prev => [...prev, {
      id: Date.now(),
      codigoAlmacen: selectedAlmacen,
      ubicacion: ubicacionInput
    }]);

    // Limpiar los campos después de agregar
    setSelectedAlmacen('');
    setUbicacionInput('');
  };

  // Función para eliminar ubicación
  const removeUbicacion = async (index: number) => {
    const ubicacion = ubicaciones[index];
    if (ubicacion.id && typeof ubicacion.id === 'number') {
      try {
        await deleteUbicacionMutation.mutateAsync(ubicacion.id);
      } catch (error) {
        console.error('Error al eliminar ubicación:', error);
      }
    }
    setUbicaciones(prev => prev.filter((_, i) => i !== index));
  };

  // Función para actualizar ubicación
  const updateUbicacion = async (index: number, field: string, value: any) => {
    const updatedUbicaciones = [...ubicaciones];
    const ubicacion = { ...updatedUbicaciones[index], [field]: value };
    updatedUbicaciones[index] = ubicacion;
    setUbicaciones(updatedUbicaciones);

    if (ubicacion.id && typeof ubicacion.id === 'number') {
      try {
        await updateUbicacionMutation.mutateAsync({
          id: ubicacion.id,
          formData: {
            idArticulo: createdArticleId || articuloId,
            idAlmacen: Number(ubicacion.codigoAlmacen),
            ubicacion: ubicacion.ubicacion,
            equipo: 'equipo',
            usuario: 0
          }
        });
      } catch (error) {
        console.error('Error al actualizar ubicación:', error);
      }
    }
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let success = false;

    try {
      // Step 1: Article
      if (activeTab === 'articulo') {
        if (!isEditing) {
          // For new article, save and get the ID
          const result: boolean | ArticleResponse = await handleCreate(data);
          console.log('Result:', result);
          // Check if result is an ArticleResponse (has id) or a boolean true
          if (result === true || (typeof result === 'object' && 'id' in result)) {
            // If result is an ArticleResponse, extract the id
            if (typeof result === 'object' && 'id' in result) {
              setCreatedArticleId(result.id);
            }
            success = true;
          }
        } else {
          // In edit mode, just update the article data
          success = await handleUpdate(data);
        }

        if (success) {
          setActiveTab('adicional');
        }
      }
      // Step 2: Additional Info (Precios y Ubicaciones)
      else if (activeTab === 'adicional') {
        const articleId = isEditing ? currentItem.id : createdArticleId;
        if (!articleId) {
          console.error('Article ID is missing');
          return;
        }

        // Only save precios and ubicaciones for the current tab
        const preciosSuccess = await saveListasPrecios(articleId);
        const ubicacionesSuccess = await saveUbicaciones(articleId);
        success = preciosSuccess && ubicacionesSuccess;

        if (success) {
          setActiveTab('detalles');
        }
      }
      // Step 3: Photos and final save
      else if (activeTab === 'detalles') {
        const articleId = isEditing ? currentItem.id : createdArticleId;
        if (!articleId) {
          console.error('Article ID is missing');
          return;
        }

        // Only save photos for the detalles tab
        success = await saveFotos(articleId);

        if (success) {
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
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

  // Debug: Monitorear cambios en principalImageIndex
  useEffect(() => {
    console.log('🔄 principalImageIndex cambió a:', principalImageIndex);
  }, [principalImageIndex]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: height,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden'
          }}
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
              className="flex-1 px-6"
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="py-6">
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
                                    {selectedOption ? String(selectedOption[field.optionLabel || 'nombre']) : 'Seleccione una opción'}
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
                                  trackColor={{ false: '#d1d5db', true: '#4b0082' }}
                                  thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
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
                        <View className="flex-row items-center">
                          <Ionicons
                            name={expandedSections.listaPrecio ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#6B7280"
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedSections.listaPrecio && (
                        <View className="mt-2">
                          {/* Form inputs for new price */}
                          <View className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                            {/* Lista de Precio */}
                            <View className="mb-4">
                              <View className="relative">
                                <TouchableOpacity
                                  onPress={() => setOpenSelect('listaPrecio')}
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                >
                                  <Text className="text-gray-700">
                                    {selectedListaPrecio ?
                                      listasPreciosData?.data.find(l => l.id === Number(selectedListaPrecio))?.nombre || 'Seleccione' :
                                      'Seleccione una lista'
                                    }
                                  </Text>
                                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>

                                {openSelect === 'listaPrecio' && (
                                  <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-48">
                                    <ScrollView 
                                    nestedScrollEnabled={true}
                                    className="max-h-48">
                                      {listasPreciosData?.data.map((lista) => (
                                        <TouchableOpacity
                                          key={lista.id}
                                          onPress={() => {
                                            setSelectedListaPrecio(String(lista.id));
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
                            <View className="mb-4">
                              <Text className="text-sm font-medium text-gray-700 mb-1">Moneda</Text>
                              <View className="relative">
                                <TouchableOpacity
                                  onPress={() => setOpenSelect('moneda')}
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                >
                                  <Text className="text-gray-700">
                                    {selectedMoneda ?
                                      monedasData?.data.find(m => m.id === Number(selectedMoneda))?.nombre || 'Seleccione' :
                                      'Seleccione una moneda'
                                    }
                                  </Text>
                                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>

                                {openSelect === 'moneda' && (
                                  <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-48">
                                    <ScrollView 
                                    nestedScrollEnabled={true}
                                    className="max-h-48">
                                      {monedasData?.data.map((moneda) => (
                                        <TouchableOpacity
                                          key={moneda.id}
                                          onPress={() => {
                                            setSelectedMoneda(String(moneda.id));
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
                            <View className="mb-4">
                              <Text className="text-sm font-medium text-gray-700 mb-1">Monto</Text>
                              <TextInput
                                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                placeholder="0.00"
                                value={precioInputs.monto}
                                onChangeText={(text) => setPrecioInputs((prev: PrecioInputs) => ({...prev, monto: text}))}
                                keyboardType="numeric"
                              />
                            </View>

                            {/* Fechas */}
                            <View className="flex-row space-x-3 mb-4">
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Fecha Desde</Text>
                                <TextInput
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                  placeholder="YYYY-MM-DD"
                                  value={precioInputs.fechaDesde}
                                  onChangeText={(text) => setPrecioInputs((prev: PrecioInputs) => ({...prev, fechaDesde: text}))}
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Fecha Hasta (opcional)</Text>
                                <TextInput
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                  placeholder="YYYY-MM-DD"
                                  value={precioInputs.fechaHasta}
                                  onChangeText={(text) => setPrecioInputs((prev: PrecioInputs) => ({...prev, fechaHasta: text}))}
                                />
                              </View>
                            </View>

                            {/* Botón agregar al final del formulario */}
                            <View className="flex-row justify-end items-center mt-4">
                              <TouchableOpacity
                                onPress={addListaPrecio}
                                disabled={!precioInputs.monto || !precioInputs.fechaDesde || !selectedListaPrecio || !selectedMoneda}
                                className={`flex-row items-center space-x-2 py-2 px-4 rounded-lg ${
                                  !precioInputs.monto || !precioInputs.fechaDesde || !selectedListaPrecio || !selectedMoneda
                                    ? 'bg-gray-100'
                                    : 'bg-blue-500'
                                }`}
                              >
                                <Ionicons 
                                  name="add-circle" 
                                  size={20} 
                                  color={!precioInputs.monto || !precioInputs.fechaDesde || !selectedListaPrecio || !selectedMoneda ? "#9CA3AF" : "#FFFFFF"} 
                                />
                                <Text className={`text-sm font-medium ${
                                  !precioInputs.monto || !precioInputs.fechaDesde || !selectedListaPrecio || !selectedMoneda
                                    ? 'text-gray-400'
                                    : 'text-white'
                                }`}>
                                  Agregar Precio
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* List of Added Prices */}
                          {listasPrecios.map((precio, index) => (
                            <View key={precio.id || `precio-${index}`} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                              <View className="space-y-3">
                                <View className="flex-row justify-between items-center">
                                  <View>
                                    <Text className="font-medium">
                                      {listasPreciosData?.data.find(l => l.id === Number(precio.codigoListasdePrecio))?.nombre || 'Lista de Precio'}
                                    </Text>
                                    <Text className="text-gray-600">
                                      {monedasData?.data.find(m => m.id === Number(precio.codigoMoneda))?.nombre || 'Moneda'}
                                    </Text>
                                    <Text className="font-bold text-lg">{Number(precio.monto).toFixed(2)}</Text>
                                    <Text className="text-sm text-gray-500">
                                      {precio.fechaDesde} {precio.fechaHasta ? `- ${precio.fechaHasta}` : ''}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center space-x-2">
                                    <Switch
                                      value={precio.suspendido}
                                      onValueChange={(value) => updateListaPrecio(index, 'suspendido', value)}
                                      trackColor={{ false: '#d1d5db', true: '#d1d5db' }}
                                      thumbColor={precio.suspendido ? '#f4f3f4' : '#f4f3f4'}
                                    />
                                    <TouchableOpacity
                                      onPress={() => removeListaPrecio(precio.id)}
                                      className="p-2"
                                    >
                                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                  </View>
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
                          {/* Form for location */}
                          <View className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                            {/* Almacén */}
                            <View className="mb-4">
                              <Text className="text-sm font-medium text-gray-700 mb-1">Almacén</Text>
                              <View className="relative">
                                <TouchableOpacity
                                  onPress={() => setOpenSelect('almacen')}
                                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                                >
                                  <Text className="text-gray-700">
                                    {selectedAlmacen ? allAlmacenes.find(a => a.id === Number(selectedAlmacen))?.nombre : 'Seleccione un almacén'}
                                  </Text>
                                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>

                                {openSelect === 'almacen' && (
                                  <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                                    <ScrollView 
                                      nestedScrollEnabled={true}
                                      className="max-h-32"
                                    >
                                      {allAlmacenes.map((almacen) => (
                                        <TouchableOpacity
                                          key={almacen.id}
                                          onPress={() => {
                                            setSelectedAlmacen(String(almacen.id));
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
                            <View className="mb-4">
                              <Text className="text-sm font-medium text-gray-700 mb-1">Ubicación Específica</Text>
                              <TextInput
                                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                                placeholder="Ej: Pasillo A, Estante 3, Nivel 2"
                                value={ubicacionInput}
                                onChangeText={setUbicacionInput}
                              />
                            </View>

                            {/* Botón agregar al final del formulario */}
                            <View className="flex-row justify-end items-center mt-4">
                              <TouchableOpacity
                                onPress={addUbicacion}
                                disabled={!selectedAlmacen || !ubicacionInput}
                                className={`flex-row items-center space-x-2 py-2 px-4 rounded-lg ${
                                  !selectedAlmacen || !ubicacionInput
                                    ? 'bg-gray-100'
                                    : 'bg-blue-500'
                                }`}
                              >
                                <Ionicons 
                                  name="add-circle" 
                                  size={20} 
                                  color={!selectedAlmacen || !ubicacionInput ? "#9CA3AF" : "#FFFFFF"} 
                                />
                                <Text className={`text-sm font-medium ${
                                  !selectedAlmacen || !ubicacionInput
                                    ? 'text-gray-400'
                                    : 'text-white'
                                }`}>
                                  Agregar Ubicación
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* List of locations */}
                          {ubicaciones.map((ubicacion, index) => (
                            <View key={ubicacion.id || `ubicacion-${index}`} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                              <View className="flex-row justify-between items-start">
                                <View>
                                  <Text className="font-medium">
                                    {allAlmacenes.find(a => a.id === Number(ubicacion.codigoAlmacen))?.nombre || 'Almacén no seleccionado'}
                                  </Text>
                                  <Text className="text-gray-600 mt-1">
                                    {ubicacion.ubicacion || 'Sin ubicación específica'}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => removeUbicacion(index)}
                                  className="p-2"
                                >
                                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
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
                            onPress={showImagePicker}
                            className="w-full py-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
                          >
                            <Ionicons name="camera-outline" size={48} color="#6B7280" />
                            <Text className="text-gray-600 font-medium mt-3">Agregar Foto</Text>
                            <Text className="text-gray-500 text-sm mt-1">Toca para tomar foto o seleccionar de galería</Text>
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
                          {/* Grid de imágenes existentes */}
                          <View className="flex-row flex-wrap">
                            {/* Botón para agregar foto - siempre en primera posición */}
                            <View className="w-[32%] mb-4 mr-[2%]">
                              <TouchableOpacity
                                onPress={showImagePicker}
                                className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                              >
                                <Ionicons name="camera-outline" size={24} color="#6B7280" />
                                <Text className="text-gray-500 text-xs mt-1 text-center">Agregar{'\n'}Foto</Text>
                              </TouchableOpacity>
                            </View>
                            {selectedImages.map((image, index) => (
                              <View key={image.id || `image-${index}`} className={`w-[32%] mb-4 ${(index + 1) % 3 === 2 ? 'mr-[2%]' : ''}`}>
                                <View className="relative">
                                  {/* Imagen con onPress para marcar como favorita */}
                                  <TouchableOpacity
                                    onPress={() => {
                                      console.log('🖱️ Imagen tocada, índice:', index);
                                      console.log('🖱️ principalImageIndex actual:', principalImageIndex);
                                      
                                      // Marcar como favorita si no es la actual
                                      if (index !== principalImageIndex) {
                                        console.log('🖱️ Marcando como favorita...');
                                        setImageAsFavorite(index);
                                      } else {
                                        console.log('🖱️ Esta imagen ya es favorita, no hacer nada');
                                      }
                                    }}
                                    activeOpacity={0.9}
                                  >
                                    <Image
                                      source={{ uri: image.uri }}
                                      style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                                      contentFit="cover"
                                    />
                                  </TouchableOpacity>

                                  {/* Botón eliminar - siempre visible */}
                                  <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-lg z-10"
                                  >
                                    <Ionicons name="close" size={16} color="white" />
                                  </TouchableOpacity>

                                  {/* Botón favorito - solo aparece en la imagen favorita actual */}
                                  {principalImageIndex === index && (
                                    <TouchableOpacity
                                      onPress={() => {
                                        // Quitar la marca de favorita
                                        setPrincipalImageIndex(-1);
                                      }}
                                      className="absolute top-2 left-2 w-8 h-8 bg-yellow-500 rounded-full items-center justify-center shadow-lg z-10"
                                    >
                                      <Ionicons name="star" size={16} color="white" />
                                    </TouchableOpacity>
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
              </View>
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

        {/* Modal de selección de imagen */}
        <Modal
          transparent
          animationType="fade"
          visible={showImagePickerModal}
          onRequestClose={() => setShowImagePickerModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-2xl p-6 mx-6 w-80">
              <Text className="text-xl font-bold text-center mb-6 text-gray-800">
                Seleccionar Imagen
              </Text>
              
              {/* Opción: Tomar Foto */}
              <TouchableOpacity
                onPress={takePhotoWithCamera}
                className="flex-row items-center p-4 bg-blue-50 rounded-lg mb-3"
              >
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="camera" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">Tomar Foto</Text>
                  <Text className="text-sm text-gray-600">Usar la cámara para tomar una nueva foto</Text>
                </View>
              </TouchableOpacity>

              {/* Opción: Galería */}
              <TouchableOpacity
                onPress={pickImageFromGallery}
                className="flex-row items-center p-4 bg-green-50 rounded-lg mb-6"
              >
                <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="images" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">Galería</Text>
                  <Text className="text-sm text-gray-600">Seleccionar una imagen existente</Text>
                </View>
              </TouchableOpacity>

              {/* Botón Cancelar */}
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                className="bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-medium">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default FormCompleteProcess;