import DropdownOverlay from '@/components/common/DropdownOverlay';
import { themes } from "@/components/Entidades/shared/theme";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useAlmacen } from "@/hooks/Inventario/useAlmacen";
import { useArticulo } from "@/hooks/Inventario/useArticulo";
import { useArticuloFoto } from "@/hooks/Inventario/useArticuloFoto";
import { useArticuloListaDePrecio } from "@/hooks/Inventario/useArticuloListaDePrecio";
import { useArticuloPresentaciones } from "@/hooks/Inventario/useArticuloPresentaciones";
import { useArticuloUbicacion } from "@/hooks/Inventario/useArticuloUbicacion";
import { useColor } from "@/hooks/Inventario/useColor";
import { useGrupo } from "@/hooks/Inventario/useGrupo";
import { usePresentacion } from "@/hooks/Inventario/usePresentacion";
import { useTalla } from "@/hooks/Inventario/useTalla";
import { useTipoDeArticulo } from "@/hooks/Inventario/useTipoDeArticulo";
import { useTipoDeImpuesto } from "@/hooks/Inventario/useTipoDeImpuesto";
import { useListaDePrecio } from "@/hooks/Ventas/useListaDePrecio";
import { useMoneda } from "@/hooks/Ventas/useMoneda";
import { DEFAULT_VALUES_INVENTORY } from "@/utils/const/defaultValues";
import { FORM_FIELDS_INVENTORY } from "@/utils/const/formFields";
import { InventoryFormData, inventorySchema } from "@/utils/schemas/inventorySchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


interface ListaPrecioItem {
  id: number;
  idListasdePrecio: string;
  idMoneda: string;
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

interface PresentacionConfig {
  equivalencia: number;
  usarEnVentas: boolean;
  usarEnCompras: boolean;
  esPrincipal: boolean;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "switch" | "select" | "date";
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
}

interface ArticleResponse {
  id: number;
  [key: string]: any;
}

// Define the form type that matches the schema
type ArticuloFormData = InventoryFormData['articulo'];

const ArticuloForm: React.FC = () => {
  const router = useRouter();
  const { id, isEditing } = useLocalSearchParams<{ id?: string; isEditing?: string }>();
  
  // Helper function for navigation
  const navigateBack = () => {
    if (isEditing === 'true' && id) {
      // Si estamos editando, simplemente volver atrás en el stack
      router.back();
    } else {
      // Si estamos creando, volver a la lista de artículos
      router.replace('/(views)/(Entidades)/EntInventario?category=articulo');
    }
  };

  const handleDropdownPress = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setDropdownPosition({
          x: pageX,
          y: pageY,
          width: width
        });
        setIsDropdownOpen(!isDropdownOpen);
      });
    } else {
      // Si el ref no está disponible, solo toggle el estado
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleViewModeChange = (newMode: 'chips' | 'dropdown') => {
    setViewMode(newMode);
    // Resetear el estado del dropdown cuando se cambia de vista
    setIsDropdownOpen(false);
    // Resetear la posición del dropdown
    setDropdownPosition({ x: 0, y: 0, width: 0 });
  };

  const [activeTab, setActiveTab] = useState("ficha");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'chips' | 'dropdown'>('chips');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownButtonRef = useRef<any>(null);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [imageOrder, setImageOrder] = useState<{[key: number]: number}>({});
  const [principalImageIndex, setPrincipalImageIndex] = useState<number>(-1);
  const [listasPrecios, setListasPrecios] = useState<ListaPrecioItem[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<string>("");
  const [selectedMoneda, setSelectedMoneda] = useState<string>("");
  const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{[key: string]: boolean}>({});
  const [showPrecioDatePicker, setShowPrecioDatePicker] = useState<{[key: string]: boolean}>({});
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>("");
  const [ubicacionInput, setUbicacionInput] = useState<string>("");
  const [precioInputs, setPrecioInputs] = useState<PrecioInputs>({
    monto: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  
  // Estados para presentaciones
  const [presentacionesConfig, setPresentacionesConfig] = useState<Record<number, PresentacionConfig>>({});
  const [presentacionesSeleccionadas, setPresentacionesSeleccionadas] = useState<Set<number>>(new Set());
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [backendFormError, setBackendFormError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estados para el modo de ordenamiento de fotos
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [selectedImageForDelete, setSelectedImageForDelete] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  

  const { 
    showCreateSuccess, 
    showUpdateSuccess,
    showError 
  } = useNotificationContext();

  // Hooks para datos
  const { useGetGrupoList } = useGrupo();
  const { useGetColorList } = useColor();
  const { useGetTallaList } = useTalla();
  const { useGetTipoDeArticuloList } = useTipoDeArticulo();
  const { useGetTipoDeImpuestoList } = useTipoDeImpuesto();
  const { useGetPresentacionList } = usePresentacion();
  const { useGetListaDePrecioList } = useListaDePrecio();
  const { useGetMonedaList } = useMoneda();
  const { useGetAlmacenList } = useAlmacen();

  // Hooks para artículo
  const { 
    useGetArticuloItem,
    useCreateArticulo, 
    useUpdateArticulo
  } = useArticulo();

  // Hooks para pasos adicionales
  const { useCreateArticuloFoto, useUpdateArticuloFoto, useGetArticuloFotoList, useDeleteArticuloFoto } = useArticuloFoto();
  const { useCreateArticuloListaDePrecio, useGetArticuloListaDePrecioList, useDeleteArticuloListaDePrecio } = useArticuloListaDePrecio();
  const { useCreateArticuloUbicacion, useGetArticuloUbicacionList, useDeleteArticuloUbicacion } = useArticuloUbicacion();
  const { 
    useCreateArticuloPresentaciones, 
    useGetArticuloPresentacionesList,
    useDeleteArticuloPresentaciones 
  } = useArticuloPresentaciones();

  // Data queries
  const { data: gruposDataArticulo } = useGetGrupoList(1, 1000);
  const { data: coloresDataArticulo } = useGetColorList(1, 1000);
  const { data: tallasDataArticulo } = useGetTallaList(1, 1000);
  const { data: listasPreciosDataArticulo } = useGetArticuloListaDePrecioList(1, 100);
  const { data: ubicacionesDataArticulo } = useGetArticuloUbicacionList(1, 100);
  const { data: tiposArticuloDataArticulo } = useGetTipoDeArticuloList(1, 1000);
  const { data: impuestosDataArticulo } = useGetTipoDeImpuestoList(1, 1000);
  const { data: presentacionesDataArticulo } = useGetPresentacionList(1, 1000);
  const { data: articuloPresentacionesData } = useGetArticuloPresentacionesList(1, 1000);
  const { data: articuloFotosData } = useGetArticuloFotoList(1, 1000);
  const { data: listasPreciosData } = useGetListaDePrecioList(1, 100);
  const { data: monedasData } = useGetMonedaList(1, 100);
  const { data: almacenesData } = useGetAlmacenList(1, 100);

  // Get filtered data for editing mode
  const preciosArticuloData = isEditing === 'true' && !!id 
    ? listasPreciosDataArticulo?.data?.filter((precio: any) => precio.idArticulo === Number(id))
    : [];
  const ubicacionesArticuloData = isEditing === 'true' && !!id 
    ? ubicacionesDataArticulo?.data?.filter((ubicacion: any) => ubicacion.idArticulo === Number(id))
    : [];

  const isEditingMode = isEditing === 'true' && !!id;

  // Get article data if editing
  const { data: currentItem, isLoading: isLoadingArticle } = useGetArticuloItem(
    isEditingMode ? Number(id) : 0
  );

  // Mutations
  const createArticuloMutation = useCreateArticulo();
  const updateArticuloMutation = useUpdateArticulo();
  const createFotoMutation = useCreateArticuloFoto();
  const updateFotoMutation = useUpdateArticuloFoto();
  const deleteFotoMutation = useDeleteArticuloFoto();
  const createPrecioMutation = useCreateArticuloListaDePrecio();
  const deletePrecioMutation = useDeleteArticuloListaDePrecio();
  const createUbicacionMutation = useCreateArticuloUbicacion();
  const deleteUbicacionMutation = useDeleteArticuloUbicacion();
  const createPresentacionMutation = useCreateArticuloPresentaciones();
  const deletePresentacionMutation = useDeleteArticuloPresentaciones();

  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS_INVENTORY['articulo'];
    return fields.map(field => {
      if (field.name === 'idGrupo' && gruposDataArticulo?.data) {
        return { ...field, options: gruposDataArticulo.data };
      }
      if (field.name === 'idColor' && coloresDataArticulo?.data) {
        return { ...field, options: coloresDataArticulo.data };
      }
      if (field.name === 'idTalla' && tallasDataArticulo?.data) {
        return { ...field, options: tallasDataArticulo.data };
      }
      if (field.name === 'idTipoArticulo' && tiposArticuloDataArticulo?.data) {
        return { ...field, options: tiposArticuloDataArticulo.data };
      }
      if (field.name === 'idImpuesto' && impuestosDataArticulo?.data) {
        return { ...field, options: impuestosDataArticulo.data };
      }
      if (field.name === 'presentaciones' && presentacionesDataArticulo?.data) {
        return { ...field, options: presentacionesDataArticulo.data };
      }
      return field;
    });
  }, [gruposDataArticulo, coloresDataArticulo, tallasDataArticulo, tiposArticuloDataArticulo, impuestosDataArticulo, presentacionesDataArticulo]);

  // Funciones para manejar presentaciones
  const updatePresentacionConfig = (
    presentacionId: number,
    field: keyof PresentacionConfig,
    value: string | boolean | number,
  ) => {
    setPresentacionesConfig((prev) => {
      const newConfig = { ...prev };
      
      // Si no existe la configuración para esta presentación, crearla
      if (!newConfig[presentacionId]) {
        newConfig[presentacionId] = {
          equivalencia: 1,
          usarEnVentas: true,
          usarEnCompras: true,
          esPrincipal: false,
        };
      }

      // Si se está marcando como principal, desmarcar todas las demás
      if (field === 'esPrincipal' && value === true) {
        Object.keys(newConfig).forEach(id => {
          if (Number(id) !== presentacionId) {
            newConfig[Number(id)].esPrincipal = false;
          }
        });
      }

      // Actualizar el campo específico
      if (field === "equivalencia" && typeof value === "string") {
        newConfig[presentacionId] = { 
          ...newConfig[presentacionId], 
          [field]: Number(value) || 1 
        };
      } else {
        newConfig[presentacionId] = { 
          ...newConfig[presentacionId], 
          [field]: value 
        };
      }

      return newConfig;
    });
  };

  const togglePresentacionSelection = (presentacionId: number) => {
    setPresentacionesSeleccionadas((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(presentacionId)) {
        // Deseleccionar: remover de selección y configuración
        newSelection.delete(presentacionId);
        setPresentacionesConfig(current => {
          const newConfig = { ...current };
          delete newConfig[presentacionId];
          return newConfig;
        });
      } else {
        // Seleccionar: agregar a selección y crear configuración por defecto
        newSelection.add(presentacionId);
        updatePresentacionConfig(presentacionId, "equivalencia", 1);
      }
      return newSelection;
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<ArticuloFormData>({
    resolver: zodResolver(
      isEditingMode 
        ? inventorySchema['articulo'].partial() // En modo edición, todos los campos son opcionales
        : inventorySchema['articulo']
    ),
    defaultValues: isEditingMode ? (currentItem as ArticuloFormData) : DEFAULT_VALUES_INVENTORY['articulo'],
  });

  // Log para debuggear errores de validación
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('❌ Errores de validación del formulario:', errors);
    }
  }, [errors]);

  useEffect(() => {
    if (isEditingMode && currentItem) {
      reset(currentItem as ArticuloFormData);
      // Las presentaciones se cargan en un useEffect separado usando articuloPresentacionesData
      // Inicializar otros campos numéricos
      [
        "peso", "volumen", "metroCubico", "pie", "puntoMinimo", "puntoMaximo",
      ].forEach((field) => {
        if ((currentItem as any)[field] !== undefined) {
          setValue(field as keyof ArticuloFormData, Number((currentItem as any)[field]) as any);
        }
      });
      // Inicializar campos booleanos
      [
        "manejaLote", "manejaSerial", "poseeGarantia", "manejaPuntoMinimo", "manejaPuntoMaximo", "suspendido",
      ].forEach((field) => {
        if ((currentItem as any)[field] !== undefined) {
          setValue(field as keyof ArticuloFormData, Boolean((currentItem as any)[field]) as any);
        }
      });
    } else {
      reset(DEFAULT_VALUES_INVENTORY['articulo'] as ArticuloFormData);
      setSelectedImages([]);
      setPrincipalImageIndex(-1);
      setListasPrecios([]);
      setUbicaciones([]);
      setSelectedListaPrecio("");
      setSelectedMoneda("");
      setCreatedArticleId(null);
      setImageOrder({});
    }
  }, [isEditingMode, currentItem, reset, setValue]);

  // Efecto separado para cargar presentaciones existentes cuando se carga articuloPresentacionesData
  useEffect(() => {
    if (isEditingMode && currentItem && articuloPresentacionesData?.data) {
      console.log('🔄 Cargando presentaciones existentes para edición...');
      
      // Filtrar presentaciones que pertenecen a este artículo
      const presentacionesExistentes = articuloPresentacionesData.data.filter(
        (articuloPres: any) => articuloPres.idArticulo === currentItem.id
      );
      
      console.log('📋 Presentaciones existentes encontradas:', presentacionesExistentes);
      
      if (presentacionesExistentes.length > 0) {
        // Crear Set de IDs seleccionados
        const idsSeleccionados = new Set(
          presentacionesExistentes.map((articuloPres: any) => articuloPres.idPresentacion)
        );
        
        // Crear configuración para cada presentación
        const config: Record<number, PresentacionConfig> = {};
        presentacionesExistentes.forEach((articuloPres: any) => {
          config[articuloPres.idPresentacion] = {
            equivalencia: articuloPres.equivalencia || 1,
            usarEnVentas: articuloPres.usarEnVentas ?? true,
            usarEnCompras: articuloPres.usarEnCompras ?? true,
            esPrincipal: articuloPres.esPrincipal ?? false
          };
        });
        
        console.log('🎯 Presentaciones seleccionadas:', Array.from(idsSeleccionados));
        console.log('⚙️ Configuración de presentaciones:', config);
        
        // Actualizar estados
        setPresentacionesSeleccionadas(idsSeleccionados);
        setPresentacionesConfig(config);
      } else {
        // Si no hay presentaciones, limpiar estados
        setPresentacionesSeleccionadas(new Set());
        setPresentacionesConfig({});
      }
    }
  }, [isEditingMode, currentItem, articuloPresentacionesData]);

  // Efecto para cargar precios existentes cuando se carga listasPreciosDataArticulo
  useEffect(() => {
    if (isEditingMode && currentItem && listasPreciosDataArticulo?.data) {
      console.log('🔄 Cargando precios existentes para edición...');
      
      // Filtrar precios que pertenecen a este artículo
      const preciosExistentes = listasPreciosDataArticulo.data.filter(
        (precio: any) => precio.idArticulo === currentItem.id
      );
      
      console.log('💰 Precios existentes encontrados:', preciosExistentes);
      
      if (preciosExistentes.length > 0) {
        // Mapear precios existentes al formato esperado
        const preciosFormateados = preciosExistentes.map((precio: any) => ({
          id: precio.id || Date.now() + Math.random(), // Usar ID del precio o generar uno único
          idListasdePrecio: precio.idListasDePrecio,
          idMoneda: precio.idMoneda,
          monto: precio.monto,
          fechaDesde: precio.fechaDesde?.replace(/-/g, "/") || "",
          fechaHasta: precio.fechaHasta?.replace(/-/g, "/") || "",
          suspendido: precio.suspendido ?? false
        }));
        
        console.log('💰 Precios formateados:', preciosFormateados);
        setListasPrecios(preciosFormateados);
      } else {
        // Si no hay precios, limpiar estado
        setListasPrecios([]);
      }
    }
  }, [isEditingMode, currentItem, listasPreciosDataArticulo]);

  // Efecto para cargar ubicaciones existentes cuando se carga ubicacionesDataArticulo
  useEffect(() => {
    if (isEditingMode && currentItem && ubicacionesDataArticulo?.data) {
      console.log('🔄 Cargando ubicaciones existentes para edición...');
      
      // Filtrar ubicaciones que pertenecen a este artículo
      const ubicacionesExistentes = ubicacionesDataArticulo.data.filter(
        (ubicacion: any) => ubicacion.idArticulo === currentItem.id
      );
      
      console.log('📍 Ubicaciones existentes encontradas:', ubicacionesExistentes);
      
      if (ubicacionesExistentes.length > 0) {
        // Mapear ubicaciones existentes al formato esperado
        const ubicacionesFormateadas = ubicacionesExistentes.map((ubicacion: any) => ({
          codigoAlmacen: ubicacion.idAlmacen, // Mapear idAlmacen a codigoAlmacen para compatibilidad
          idAlmacen: ubicacion.idAlmacen, // Mantener ambos por compatibilidad
          ubicacion: ubicacion.ubicacion,
          suspendido: ubicacion.suspendido ?? false
        }));
        
        console.log('📍 Ubicaciones formateadas:', ubicacionesFormateadas);
        setUbicaciones(ubicacionesFormateadas);
      } else {
        // Si no hay ubicaciones, limpiar estado
        setUbicaciones([]);
      }
    }
  }, [isEditingMode, currentItem, ubicacionesDataArticulo]);

  // Efecto para cargar fotos existentes cuando se carga articuloFotosData
  useEffect(() => {
    if (isEditingMode && currentItem && articuloFotosData?.data) {
      console.log('🔄 Cargando fotos existentes para edición...');
      
      // Filtrar fotos que pertenecen a este artículo
      const fotosExistentes = articuloFotosData.data.filter(
        (foto: any) => foto.idArticulo === currentItem.id
      );
      
      console.log('📸 Fotos existentes encontradas:', fotosExistentes);
      
      if (fotosExistentes.length > 0) {
        // Mapear fotos existentes al formato esperado
        const fotosFormateadas = fotosExistentes.map((foto: any, index: number) => ({
          id: foto.id,
          fotoId: foto.id, // ID de la foto para actualizaciones
          uri: `https://wise.filicabh.com.ve:5000/${foto.urlFoto}`,
          urlFoto: foto.urlFoto,
          esPrincipal: foto.esPrincipal ?? false,
          orden: foto.orden || index + 1,
          existente: true, // Marcador para saber que es una foto existente
          name: `existing_image_${foto.id}.jpg`,
          type: 'image/jpeg'
        }));
        
        // Crear el orden de imágenes
        const ordenImagenes: {[key: number]: number} = {};
        fotosFormateadas.forEach((foto, index) => {
          ordenImagenes[index] = foto.orden;
        });
        
        // Encontrar la imagen principal
        const principalIndex = fotosFormateadas.findIndex(foto => foto.esPrincipal);
        
        console.log('📸 Fotos formateadas:', fotosFormateadas);
        console.log('📸 Orden de imágenes:', ordenImagenes);
        console.log('📸 Índice principal:', principalIndex);
        
        // Actualizar estados
        setSelectedImages(fotosFormateadas);
        setImageOrder(ordenImagenes);
        setPrincipalImageIndex(principalIndex >= 0 ? principalIndex : -1);
      } else {
        // Si no hay fotos, limpiar estados
        setSelectedImages([]);
        setImageOrder({});
        setPrincipalImageIndex(-1);
      }
    }
  }, [isEditingMode, currentItem, articuloFotosData]);

  // Helper functions for form fields formatting
  const getFormattedValueByType = (
    fieldName: string,
    fieldType: string,
    text: string,
  ): string | number => {
    if (fieldType === "date") {
      return text;
    }

    if (fieldType === "number") {
      const cleanedValue = text.trim().replace(",", ".");
      
      if (!cleanedValue || cleanedValue === "") {
        return 0;
      }

      if (["nroCuenta", "telefono", "dias", "nit", "idRegion", "codigoTipoVendedor", "idListaPrecio", "codigoMoneda", "idPais", "idCiudad", "idRubro", "idSector", "idVendedor", "idAcuerdoDePago", "idTipoPersona", "puntoMinimo", "puntoMaximo", "stockActual", "codigoFiguraComercialCasaMatriz"].includes(fieldName)) {
        const numericValue = parseInt(cleanedValue, 10);
        return isNaN(numericValue) ? 0 : numericValue;
      }

      const numericValue = parseFloat(cleanedValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }

    return text;
  };

  const getKeyboardType = (fieldName: string, fieldType: string) => {
    if (fieldType === "number" || ["nroCuenta", "telefono", "dias", "nit", "codigo"].includes(fieldName)) {
      return "numeric";
    }
    if (fieldType === "email") {
      return "email-address";
    }
    return "default";
  };

  // Image handling functions
  const processSelectedImage = (result: any) => {
    try {
      console.log('📷 Processing selected image:', result);
      
      if (!result || result.cancelled || result.canceled) {
        console.log('📷 Image selection was cancelled');
        return;
      }

      if (!result.assets || !result.assets[0]) {
        console.error('📷 No assets found in result');
        alert('Error: No se pudo obtener la imagen seleccionada');
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      let mimeType = "image/jpeg";
      if (fileExtension === "png") {
        mimeType = "image/png";
      } else if (fileExtension === "gif") {
        mimeType = "image/gif";
      } else if (fileExtension === "webp") {
        mimeType = "image/webp";
      }

      const newImage = {
        id: Date.now(),
        uri: asset.uri,
        name: fileName,
        type: mimeType,
        file: {
          ...asset,
          type: mimeType,
        },
      };

      console.log('📷 Adding new image:', newImage);
      setSelectedImages((prev) => [...prev, newImage]);
      
      // Auto-assign next available order
      const nextOrder = getNextAvailableOrder();
      setImageOrder(prev => ({
        ...prev,
        [newImage.id]: nextOrder
      }));
      
      console.log('📷 Image processed successfully');
    } catch (error) {
      console.error('📷 Error processing selected image:', error);
      alert('Error al procesar la imagen seleccionada');
    }
  };

  const pickImageFromGallery = async () => {
    setShowImagePickerModal(false);
    
    try {
      // Primero verificar el estado actual de los permisos
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      let finalStatus = status;
      
      if (status !== 'granted') {
        // Si no tiene permisos, solicitarlos
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = newStatus;
      }
      
      if (finalStatus !== 'granted') {
        alert("Se necesitan permisos para acceder a la galería. Por favor, habilítalos en configuración.");
        return;
      }
      
      console.log('📸 Abriendo galería con permisos:', finalStatus);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      console.log('📸 Resultado de galería:', result);
      processSelectedImage(result);
    } catch (error) {
      console.error('❌ Error al abrir galería:', error);
      alert("Error al acceder a la galería. Inténtalo de nuevo.");
    }
  };

  const takePhotoWithCamera = async () => {
    setShowImagePickerModal(false);
    
    try {
      // Primero verificar el estado actual de los permisos de cámara
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      let finalStatus = status;
      
      if (status !== 'granted') {
        // Si no tiene permisos, solicitarlos
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        finalStatus = newStatus;
      }
      
      if (finalStatus !== 'granted') {
        alert("Se necesitan permisos para acceder a la cámara. Por favor, habilítalos en configuración.");
        return;
      }
      
      console.log('📸 Abriendo cámara con permisos:', finalStatus);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      console.log('📸 Resultado de cámara:', result);
      processSelectedImage(result);
    } catch (error) {
      console.error('❌ Error al abrir cámara:', error);
      alert("Error al acceder a la cámara. Inténtalo de nuevo.");
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = selectedImages[index];
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    
    // Update image order mapping
    setImageOrder((prev) => {
      const newOrder = { ...prev };
      delete newOrder[imageToRemove.id];
      
      // Adjust order numbers for remaining images
      const removedOrder = prev[imageToRemove.id];
      if (removedOrder) {
        Object.keys(newOrder).forEach(imageId => {
          if (newOrder[Number(imageId)] > removedOrder) {
            newOrder[Number(imageId)]--;
          }
        });
      }
      
      return newOrder;
    });
    
    if (principalImageIndex === index) {
      setPrincipalImageIndex(-1);
    } else if (principalImageIndex > index) {
      setPrincipalImageIndex(principalImageIndex - 1);
    }
  };

  const setImageOrderNumber = (imageId: number, order: number) => {
    setImageOrder((prev) => {
      const newOrder = { ...prev };
      
      // If trying to set the same order, do nothing
      if (newOrder[imageId] === order) return prev;
      
      // Find image that currently has this order
      const currentImageWithOrder = Object.keys(newOrder).find(id => newOrder[Number(id)] === order);
      
      // If another image has this order, swap them
      if (currentImageWithOrder) {
        const oldOrder = newOrder[imageId];
        newOrder[Number(currentImageWithOrder)] = oldOrder;
      }
      
      newOrder[imageId] = order;
      
      // Update principal image index if order 1 changed
      if (order === 1) {
        const imageIndex = selectedImages.findIndex(img => img.id === imageId);
        setPrincipalImageIndex(imageIndex);
      }
      
      return newOrder;
    });
  };

  const getNextAvailableOrder = () => {
    const usedOrders = Object.values(imageOrder);
    for (let i = 1; i <= selectedImages.length + 1; i++) {
      if (!usedOrders.includes(i)) {
        return i;
      }
    }
    return selectedImages.length + 1;
  };

  const setImageAsFavorite = (index: number) => {
    const imageId = selectedImages[index].id;
    
    // Toggle principal status
    const currentOrder = imageOrder[imageId];
    if (currentOrder === 1) {
      // Remove from principal (set to next available order)
      const nextOrder = getNextAvailableOrder();
      setImageOrderNumber(imageId, nextOrder);
      setPrincipalImageIndex(-1);
    } else {
      // Set as principal (order 1)
      setImageOrderNumber(imageId, 1);
      setPrincipalImageIndex(index);
    }
  };

  // Función para manejar el modo de ordenamiento
  const toggleOrderMode = () => {
    if (isOrderMode) {
      // Salir del modo ordenamiento
      setIsOrderMode(false);
    } else {
      // Entrar al modo ordenamiento - limpiar todos los órdenes
      const newImageOrder: {[key: number]: number} = {};
      setImageOrder(newImageOrder);
      setIsOrderMode(true);
    }
  };

  // Función para manejar la selección de orden en modo ordenamiento
  const handleOrderSelection = (imageId: number) => {
    if (!isOrderMode) return;
    
    // Obtener el siguiente orden disponible
    const nextOrder = Object.keys(imageOrder).length + 1;
    setImageOrderNumber(imageId, nextOrder);
    
    // Si es la primera foto seleccionada, hacerla principal
    if (nextOrder === 1) {
      const imageIndex = selectedImages.findIndex(img => img.id === imageId);
      if (imageIndex !== -1) {
        setPrincipalImageIndex(imageIndex);
      }
    }
  };

  // Función para manejar el long press para eliminar
  const handleImageLongPress = (index: number) => {
    setSelectedImageForDelete(index);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteImage = () => {
    if (selectedImageForDelete !== null) {
      removeImage(selectedImageForDelete);
      setSelectedImageForDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Función para cancelar eliminación
  const cancelDeleteImage = () => {
    setSelectedImageForDelete(null);
    setShowDeleteModal(false);
  };

  // List management functions
  const addListaPrecio = () => {
    if (selectedListaPrecio && selectedMoneda && precioInputs.monto) {
      const nuevoPrecio: ListaPrecioItem = {
        id: Date.now(),
        idListasdePrecio: selectedListaPrecio,
        idMoneda: selectedMoneda,
        monto: precioInputs.monto,
        fechaDesde: precioInputs.fechaDesde,
        fechaHasta: precioInputs.fechaHasta,
        suspendido: false,
      };

      setListasPrecios((prev) => [...prev, nuevoPrecio]);
      setPrecioInputs({ monto: "", fechaDesde: "", fechaHasta: "" });
      setSelectedListaPrecio("");
      setSelectedMoneda("");
    }
  };

  const removeListaPrecio = (id: number) => {
    setListasPrecios((prev) => prev.filter((precio) => precio.id !== id));
  };

  const addUbicacion = () => {
    if (selectedAlmacen && ubicacionInput) {
      const nuevaUbicacion = {
        id: Date.now(),
        codigoAlmacen: selectedAlmacen,
        ubicacion: ubicacionInput,
      };

      setUbicaciones((prev) => [...prev, nuevaUbicacion]);
      setUbicacionInput("");
      setSelectedAlmacen("");
    }
  };

  const removeUbicacion = (index: number) => {
    setUbicaciones((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission functions
  const saveFotos = async (articleId: number): Promise<boolean> => {
    try {
      // Solo procesar si hay fotos que agregar
      if (selectedImages.length === 0) {
        console.log('📸 No hay fotos para procesar');
        return true;
      }

      console.log(`📸 Procesando ${selectedImages.length} fotos...`);
      
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const order = imageOrder[i] || i + 1;
        const esPrincipal = i === principalImageIndex;
        
        console.log(`📸 Procesando foto ${i + 1}:`, {
          orden: order,
          esPrincipal,
          existente: image.existente || false,
          fotoId: image.fotoId,
          uri: image.uri
        });
        
        // Prepare the parameters object
        const fotoParams = {
          idArticulo: articleId,
          esPrincipal,
          orden: order,
          equipo: "mobile",
          imageFile: {
            uri: image.uri,
            name: image.name || `image_${i + 1}.jpg`,
            type: image.type || 'image/jpeg',
          }
        };

        try {
          if (image.existente && image.fotoId) {
            // Actualizar foto existente usando PUT /api/articulofoto/{id}
            console.log(`🔄 Actualizando foto existente ID: ${image.fotoId}`);
            await updateFotoMutation.mutateAsync({ 
              id: image.fotoId, 
              params: fotoParams 
            });
            console.log(`✅ Foto ${i + 1} actualizada exitosamente`);
          } else {
            // Crear nueva foto usando POST /api/articulofoto
            console.log(`🆕 Creando nueva foto`);
            await createFotoMutation.mutateAsync(fotoParams);
            console.log(`✅ Foto ${i + 1} creada exitosamente`);
          }
        } catch (error) {
          console.error(`❌ Error procesando foto ${i + 1}:`, error);
          // Continuar con las demás fotos
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error general al guardar fotos:", error);
      return false;
    }
  };

  const saveListasPrecios = async (articleId: number): Promise<boolean> => {
    try {
      // Solo procesar si hay precios nuevos que agregar
      if (listasPrecios.length === 0) {
        console.log('💰 No hay precios nuevos para procesar');
        return true;
      }

      // En modo edición, eliminar precios existentes solo si hay precios nuevos
      if (isEditingMode && listasPreciosDataArticulo?.data && listasPrecios.length > 0) {
        console.log('🗑️ Eliminando precios existentes en modo edición...');
        
        const preciosExistentes = listasPreciosDataArticulo.data.filter(
          (precio: any) => precio.idArticulo === articleId
        );
        
        console.log(`💰 ${preciosExistentes.length} precios existentes encontrados`);
        
        for (const precioExistente of preciosExistentes) {
          try {
            console.log(`🗑️ Eliminando precio ID: ${precioExistente.id}`);
            await deletePrecioMutation.mutateAsync(precioExistente.id);
            console.log(`✅ Precio ${precioExistente.id} eliminado`);
          } catch (error) {
            console.error(`❌ Error eliminando precio ${precioExistente.id}:`, error);
            // Continuar con las demás eliminaciones
          }
        }
      }

      // Crear nuevos precios
      console.log(`💰 Creando ${listasPrecios.length} nuevos precios...`);
      
      for (const precio of listasPrecios) {
        const precioData = {
          idArticulo: articleId,
          idListasDePrecio: Number(precio.idListasdePrecio),
          idMoneda: Number(precio.idMoneda),
          monto: Number(precio.monto),
          fechaDesde: precio.fechaDesde.replaceAll("/", "-"),
          fechaHasta: precio.fechaHasta.replaceAll("/", "-"),
          suspendido: precio.suspendido,
        };

        await createPrecioMutation.mutateAsync(precioData);
      }
      
      return true;
    } catch (error) {
      console.error("Error al guardar precios:", error);
      return false;
    }
  };

  const saveUbicaciones = async (articleId: number): Promise<boolean> => {
    try {
      // Solo procesar si hay ubicaciones nuevas que agregar
      if (ubicaciones.length === 0) {
        console.log('📍 No hay ubicaciones nuevas para procesar');
        return true;
      }

      // En modo edición, eliminar ubicaciones existentes solo si hay ubicaciones nuevas
      if (isEditingMode && ubicacionesDataArticulo?.data && ubicaciones.length > 0) {
        console.log('🗑️ Eliminando ubicaciones existentes en modo edición...');
        
        const ubicacionesExistentes = ubicacionesDataArticulo.data.filter(
          (ubicacion: any) => ubicacion.idArticulo === articleId
        );
        
        console.log(`📍 ${ubicacionesExistentes.length} ubicaciones existentes encontradas`);
        
        for (const ubicacionExistente of ubicacionesExistentes) {
          try {
            console.log(`🗑️ Eliminando ubicación ID: ${ubicacionExistente.id}`);
            await deleteUbicacionMutation.mutateAsync(ubicacionExistente.id);
            console.log(`✅ Ubicación ${ubicacionExistente.id} eliminada`);
          } catch (error) {
            console.error(`❌ Error eliminando ubicación ${ubicacionExistente.id}:`, error);
            // Continuar con las demás eliminaciones
          }
        }
      }

      // Crear nuevas ubicaciones
      console.log(`📍 Creando ${ubicaciones.length} nuevas ubicaciones...`);
      
      for (const ubicacion of ubicaciones) {
        const ubicacionData = {
          idArticulo: articleId,
          idAlmacen: Number(ubicacion.codigoAlmacen || ubicacion.idAlmacen),
          ubicacion: ubicacion.ubicacion,
          suspendido: ubicacion.suspendido ?? false,
        };

        await createUbicacionMutation.mutateAsync(ubicacionData);
      }
      
      return true;
    } catch (error) {
      console.error("Error al guardar ubicaciones:", error);
      return false;
    }
  };

  // Función para limpiar datos del artículo (remover presentaciones)
  const cleanArticuloData = (formData: any) => {
    // Remover presentaciones y cualquier campo que no sea parte del esquema del artículo
    const { presentaciones, ...cleanData } = formData;
    
    // Asegurar que los campos numéricos sean números
    const numericFields = ['peso', 'volumen', 'metroCubico', 'pie', 'puntoMinimo', 'puntoMaximo'];
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        cleanData[field] = Number(cleanData[field]);
      }
    });
    
    // Asegurar que los campos booleanos sean booleanos
    const booleanFields = ['manejaLote', 'manejaSerial', 'poseeGarantia', 'manejaPuntoMinimo', 'manejaPuntoMaximo', 'suspendido'];
    booleanFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        cleanData[field] = Boolean(cleanData[field]);
      }
    });
    
    console.log('🧹 Datos limpiados para artículo (sin presentaciones):', cleanData);
    return cleanData;
  };

  // Función para manejar presentaciones
  const handlePresentaciones = async (articleId: number): Promise<boolean> => {
    if (!articleId || presentacionesSeleccionadas.size === 0) {
      console.log('❌ No hay articleId o presentaciones seleccionadas para procesar');
      return true; // No es error si no hay presentaciones seleccionadas
    }

    try {
      console.log(`💾 Procesando presentaciones para artículo ${articleId}...`);
      console.log(`📋 Presentaciones seleccionadas:`, Array.from(presentacionesSeleccionadas));
      
      // En modo edición, primero eliminar presentaciones existentes
      if (isEditingMode && articuloPresentacionesData?.data) {
        console.log('🗑️ Eliminando presentaciones existentes en modo edición...');
        
        const presentacionesExistentes = articuloPresentacionesData.data.filter(
          (articuloPres: any) => articuloPres.idArticulo === articleId
        );
        
        console.log(`📋 ${presentacionesExistentes.length} presentaciones existentes encontradas`);
        
        for (const presentacionExistente of presentacionesExistentes) {
          try {
            console.log(`🗑️ Eliminando presentación ID: ${presentacionExistente.id}`);
            await deletePresentacionMutation.mutateAsync(presentacionExistente.id);
            console.log(`✅ Presentación ${presentacionExistente.id} eliminada`);
          } catch (error) {
            console.error(`❌ Error eliminando presentación ${presentacionExistente.id}:`, error);
            // Continuar con las demás eliminaciones
          }
        }
      }

      // Crear nuevas presentaciones con su configuración específica
      console.log(`📦 Creando ${presentacionesSeleccionadas.size} nuevas presentaciones...`);
      
      let i = 0;
      for (const presentacionId of presentacionesSeleccionadas) {
        const config = presentacionesConfig[presentacionId];
        if (!config) continue; // Skip si no tiene configuración
        
        const presentacionData = {
          idArticulo: articleId,
          idPresentacion: presentacionId,
          esPrincipal: Boolean(config.esPrincipal),
          equivalencia: Number(config.equivalencia) || 1,
          usarEnVentas: Boolean(config.usarEnVentas),
          usarEnCompras: Boolean(config.usarEnCompras),
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 0,
          equipo: 'mobile'
        };

        console.log(`📦 Creando presentación ${i + 1}:`, presentacionData);
        
        await createPresentacionMutation.mutateAsync(presentacionData);
        
        console.log(`✅ Presentación ${i + 1} creada exitosamente`);
        i++;
      }

      console.log('🎉 Presentaciones procesadas exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error procesando presentaciones:', error);
      throw error;
    }
  };

  const handleCreate = async (formData: any): Promise<boolean | ArticleResponse> => {
    setBackendFormError(null);
    try {
      // Limpiar datos para remover presentaciones del payload del artículo
      const cleanData = cleanArticuloData(formData);
      const result = await createArticuloMutation.mutateAsync(cleanData);
      showCreateSuccess('el artículo');
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al crear artículo';
      setBackendFormError(errorMessage);
      return false;
    }
  };

  const handleUpdate = async (formData: any): Promise<boolean> => {
    console.log('🔄 handleUpdate ejecutándose...');
    let articleId = null;
    console.log('SE LLAMO EL HANDLE UPDATE');
    if(isEditingMode && currentItem){
      console.log('SE LLAMO EL HANDLE UPDATE EN EDIT MODE');
      console.log(currentItem);
      articleId = currentItem.id;
    }else if(createdArticleId){
      articleId = createdArticleId;
    }
    if (!articleId) {
      console.log('NO HAY UN ITEM SELECCIONADO PARA ACTUALIZAR');
      setBackendFormError("Error: No hay un ítem seleccionado para actualizar.");
      return false;
    }
    setBackendFormError(null);

    try {
      // Actualizar el artículo principal
      console.log('📝 Datos del formulario recibidos:', formData);
      console.log('📝 Cantidad de claves:', Object.keys(formData).length);
      
      // En modo edición, siempre actualizar incluso si no hay cambios
      if (isEditingMode) {
        console.log('📝 Actualizando datos del artículo principal...');
        // Limpiar datos para remover presentaciones del payload del artículo
        const cleanData = cleanArticuloData(formData);
        console.log('📝 Datos limpiados para envío:', cleanData);
        
        await updateArticuloMutation.mutateAsync({ id: articleId, formData: cleanData });
        console.log('LUEGO DEL LLAMADO A UPDATE ARTICULO');
        showUpdateSuccess('el artículo');
      } else if (Object.keys(formData).length > 0) {
        // En modo creación, solo actualizar si hay datos
        console.log('📝 Actualizando datos del artículo principal...');
        const cleanData = cleanArticuloData(formData);
        console.log('📝 Datos limpiados para envío:', cleanData);
        
        await updateArticuloMutation.mutateAsync({ id: articleId, formData: cleanData });
        console.log('LUEGO DEL LLAMADO A UPDATE ARTICULO');
        showUpdateSuccess('el artículo');
      } else {
        console.log('ℹ️ No hay datos del formulario para actualizar');
      }
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al actualizar artículo';
      setBackendFormError(errorMessage);
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    console.log('🚀 onSubmit ejecutándose. ActiveTab:', activeTab, 'isEditingMode:', isEditingMode);
    console.log('📊 Datos recibidos:', data);
    console.log('📊 Errores del formulario:', errors);
    
    if (isSubmitting) {
      console.log('⚠️ Ya está enviando, retornando...');
      return;
    }

    setIsSubmitting(true);
    let success = false;

    try {
      // Handle different tab submissions
      if (activeTab === "ficha") {
        if (!isEditingMode) {
          const result: boolean | ArticleResponse = await handleCreate(data);

          if (result === true || (typeof result === "object" && "id" in result)) {
            if (typeof result === "object" && "id" in result) {
              console.log('SE SETEO EL ID DEL ARTICULO');
              console.log(result.id);
              setCreatedArticleId(result.id);
            }
            success = true;
          }
        } else {
          console.log('🔄 Actualizando artículo en modo edición...');
          // En modo edición, siempre usar getValues para obtener todos los datos del formulario
          const formData = getValues();
          console.log('📝 Datos para actualización:', formData);
          console.log('📝 Campo presentaciones:', formData.presentaciones);
          console.log('📝 Tipo de presentaciones:', typeof formData.presentaciones);
          
          // Asegurar que el campo presentaciones sea un array de números
          if (formData.presentaciones && typeof formData.presentaciones === 'object' && !Array.isArray(formData.presentaciones)) {
            console.log('⚠️ Campo presentaciones es un objeto, convirtiendo a array...');
            formData.presentaciones = Array.from(presentacionesSeleccionadas);
          }
          
          success = await handleUpdate(formData);
          console.log('✅ Resultado de actualización:', success);
        }

        if (success) {
          console.log('✅ Ficha procesada exitosamente. isEditingMode:', isEditingMode);
          if (isEditingMode) {
            // En modo edición, mostrar notificación de éxito
            console.log('🎉 Mostrando notificación de actualización exitosa...');
            showUpdateSuccess('el artículo');
            // Opcional: navegar a la siguiente pestaña después de un breve delay
            setTimeout(() => {
              setActiveTab("presentaciones");
            }, 1500);
          } else {
            // En modo creación, mostrar modal de éxito
            console.log('🎉 Mostrando modal de éxito para creación...');
            setShowSuccessModal(true);
          }
        }
      }
      else if (activeTab === "presentaciones") {
        console.log('🎯 Procesando presentaciones...');
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        
        if (articleId && presentacionesSeleccionadas.size > 0) {
          console.log("📋 Presentaciones seleccionadas:", Array.from(presentacionesSeleccionadas));
          
          try {
            // Usar la nueva función para manejar presentaciones
            success = await handlePresentaciones(articleId);
            
            if (success) {
              console.log('✅ Presentaciones procesadas exitosamente. isEditingMode:', isEditingMode);
              if (isEditingMode) {
                // En modo edición, mostrar notificación de éxito
                console.log('🎉 Mostrando notificación de actualización de presentaciones...');
                showUpdateSuccess('las presentaciones');
                // Opcional: navegar a la siguiente pestaña después de un breve delay
                setTimeout(() => {
                  setActiveTab("detalles");
                }, 1500);
              } else {
                console.log('🎉 Mostrando mensaje de creación de presentaciones...');
                showCreateSuccess('las presentaciones');
                setShowSuccessModal(true);
              }
            }
          } catch (error) {
            console.error('❌ Error procesando presentaciones:', error);
            const errorMessage = error.response?.data?.mensaje || error.message || 'Error al procesar presentaciones';
            setBackendFormError(errorMessage);
            success = false;
          }
        } else {
          console.log('⚠️ No hay artículo ID o presentaciones para procesar');
          success = false;
        }
      }
      else if (activeTab === "detalles") {
        console.log('🔧 Procesando detalles del artículo...');
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        
        if (articleId) {
          // En modo edición, siempre usar getValues para obtener todos los datos del formulario
          const formData = getValues();
          console.log('📝 Datos para actualización de detalles:', formData);
          console.log('📝 Campo presentaciones en detalles:', formData.presentaciones);
          console.log('📝 Tipo de presentaciones en detalles:', typeof formData.presentaciones);
          
          // Asegurar que el campo presentaciones sea un array de números
          if (formData.presentaciones && typeof formData.presentaciones === 'object' && !Array.isArray(formData.presentaciones)) {
            console.log('⚠️ Campo presentaciones es un objeto, convirtiendo a array...');
            formData.presentaciones = Array.from(presentacionesSeleccionadas);
          }
          
          success = await handleUpdate(formData);
          console.log('✅ Resultado de actualización de detalles:', success);
          
          if (success) {
            if (isEditingMode) {
              // En modo edición, mostrar notificación de éxito
              showUpdateSuccess('los detalles del artículo');
              // Opcional: navegar a la siguiente pestaña después de un breve delay
              setTimeout(() => {
                setActiveTab("precios");
              }, 1500);
            } else {
              showCreateSuccess('los detalles del artículo');
              setShowSuccessModal(true);
            }
          }
        } else {
          console.log('⚠️ No hay artículo ID para procesar detalles');
          success = false;
        }
      }
      else if (activeTab === "precios") {
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (!articleId) {
          console.error("Article ID is missing");
          return;
        }

        success = await saveListasPrecios(articleId);
        if (success) {
          if (isEditingMode) {
            // En modo edición, mostrar notificación de éxito
            showUpdateSuccess('los precios');
            // Opcional: navegar a la siguiente pestaña después de un breve delay
            setTimeout(() => {
              setActiveTab("ubicaciones");
            }, 1500);
          } else {
            showCreateSuccess('los precios');
            setShowSuccessModal(true);
          }
        }
      }
      else if (activeTab === "ubicaciones") {
        console.log('ubicaciones');
        console.log(isEditingMode);
        console.log(currentItem);
        console.log(createdArticleId);
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (!articleId) {
          console.error("Article ID is missing");
          return;
        }

        success = await saveUbicaciones(articleId);
        if (success) {
          if (isEditingMode) {
            // En modo edición, mostrar notificación de éxito
            showUpdateSuccess('las ubicaciones');
            // Opcional: navegar a la siguiente pestaña después de un breve delay
            setTimeout(() => {
              setActiveTab("fotos");
            }, 1500);
          } else {
            showCreateSuccess('las ubicaciones');
            setShowSuccessModal(true);
          }
        }
      }
      else if (activeTab === "fotos") {
        console.log('Estamos en fotos')
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (!articleId) {
          console.error("Article ID is missing");
          return;
        }

        success = await saveFotos(articleId);
        if (success) {
          if (isEditingMode) {
            // En modo edición, navegar directamente sin mostrar notificación
            navigateBack();
          } else {
            showCreateSuccess('las fotos');
            setTimeout(() => {
              navigateBack();
            }, 1500);
          }
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPress = (fieldName: string) => {
    setOpenSelect(openSelect === fieldName ? null : fieldName);
  };

  // Define fields for each tab with proper required marking
  const getFichaFields = () => {
    const allFields = getFormFields();
    const fichaFieldNames = ['nombre', 'codigoArticulo', 'codigoModelo', 'codigoBarra', 'descripcion', 'idTipoArticulo', 'idGrupo', 'idImpuesto', 'manejaLote', 'manejaSerial', 'suspendido'];
    return allFields.filter(field => fichaFieldNames.includes(field.name)).map(field => {
      // Mark required fields as specified
      if (['nombre', 'idTipoArticulo', 'idGrupo', 'idImpuesto'].includes(field.name)) {
        return { ...field, required: true };
      }
      return field;
    });
  };

  const getPresentacionesFields = () => {
    const allFields = getFormFields();
    const presentacionesFieldNames = ['presentaciones'];
    return allFields.filter(field => presentacionesFieldNames.includes(field.name));
  };

  const getDetallesFields = () => {
    const allFields = getFormFields();
    const detallesFieldNames = ['idColor', 'idTalla', 'peso', 'volumen', 'metroCubico', 'pie', 'manejaPuntoMinimo', 'manejaPuntoMaximo', 'puntoMinimo', 'puntoMaximo', 'poseeGarantia', 'descripcionGarantia'];
    return allFields.filter(field => detallesFieldNames.includes(field.name));
  };

  // Get fields based on active tab
  const getActiveTabFields = () => {
    switch (activeTab) {
      case 'ficha':
        return getFichaFields();
      case 'presentaciones':
        return getPresentacionesFields();
      case 'detalles':
        return getDetallesFields();
      default:
        return [];
    }
  };

  // Separate fields by type for current tab
  const activeFields = getActiveTabFields();
  const textFields = activeFields.filter((f) => f.type === "text" || f.type === "number");
  const switchFields = activeFields.filter((f) => f.type === "switch");
  const selectFields = activeFields.filter((f) => f.type === "select");

  if (isLoadingArticle) {
    return (
      <View style={{ flex: 1 }} className="bg-gray-50">
        <View 
          className="px-4 pt-4 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.inventory.headerColor }}
        >
          <TouchableOpacity
            onPress={() => {
              navigateBack();
            }}
            className="mr-3 p-2 rounded-full bg-white/10"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={themes.inventory.headerTextColor} 
            />
          </TouchableOpacity>
          <Text 
            className="text-lg font-medium"
            style={{ color: themes.inventory.headerTextColor }}
          >
            Cargando...
          </Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-8 mx-4 items-center shadow-sm">
            <Ionicons name="refresh" size={48} color={themes.inventory.buttonColor} />
            <Text className="text-gray-600 text-lg font-medium mt-4">Cargando formulario</Text>
            <Text className="text-gray-500 text-center mt-2">Preparando información...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} className="bg-gray-50">
      {/* Header */}
      <View 
        className="px-4 pt-4 pb-2 shadow-sm"
        style={{ backgroundColor: themes.inventory.headerColor }}
      >
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => {
              navigateBack();
            }}
            className="mr-3 p-2 rounded-full bg-white/10"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={themes.inventory.headerTextColor} 
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text 
              className="text-lg font-bold"
              style={{ color: themes.inventory.headerTextColor }}
            >
              {isEditingMode ? "Editar Artículo" : "Nuevo Artículo"}
            </Text>
            <Text 
              className="text-sm opacity-80"
              style={{ color: themes.inventory.headerTextColor }}
            >
              {isEditingMode ? "Modifica la información del artículo" : "Completa la información del artículo"}
            </Text>
          </View>
        </View>

        {/* Tab Navigation - Chips or Dropdown Style */}
        <View className="py-2">
          {viewMode === 'chips' ? (
            <View className="flex-row items-center justify-between py-3">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 0 }}
                style={{ flex: 1 }}
              >
                {[
                  { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                  { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                  { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                  { id: "precios", name: "Precio", icon: "pricetag-outline" },
                  { id: "ubicaciones", name: "Ubicacion", icon: "location-outline" },
                  { id: "fotos", name: "Fotos", icon: "camera-outline" }
                ].map((tab, index) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={{
                      marginRight: index < 5 ? 4 : 0, // Aplicar margen a todos excepto el último
                      paddingHorizontal: 12, // Reducido de 16 a 12
                      paddingVertical: 8, // Reducido de 8 a 6
                      borderRadius: 6, // Reducido de 8 a 6
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)',
                      borderWidth: 1,
                      borderColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.3)',
                      shadowColor: activeTab === tab.id ? '#000' : 'transparent',
                      shadowOffset: activeTab === tab.id ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: activeTab === tab.id ? 0.1 : 0,
                      shadowRadius: activeTab === tab.id ? 4 : 0,
                      elevation: activeTab === tab.id ? 3 : 0
                    }}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={14} // Reducido de 16 a 14
                      color={activeTab === tab.id ? themes.inventory.buttonColor : 'rgba(255,255,255,0.8)'}
                      style={{ marginRight: 4 }} // Reducido de 6 a 4
                    />
                    <Text
                      style={{
                        color: activeTab === tab.id ? themes.inventory.buttonColor : 'rgba(255,255,255,0.8)',
                        fontWeight: activeTab === tab.id ? '600' : 'normal',
                        fontSize: 12 // Reducido de 14 a 12
                      }}
                    >
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                className="bg-white rounded-xl p-1.5 flex-row items-center ml-3" // Cambiado de rounded-2xl p-2 a rounded-xl p-1.5
                onPress={() => handleViewModeChange('dropdown')}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <Ionicons
                  name="list-outline"
                  size={16} // Reducido de 18 a 16
                  color={themes.inventory.headerColor}
                />
                <Text style={{ color: themes.inventory.headerColor }} className="ml-1 text-xs">
                  Lista
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-4 relative">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 6, // Reducido de 8 a 6
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)',
                    padding: 10, // Reducido de 12 a 10
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                    marginRight: 12
                  }}
                  onPress={handleDropdownPress}
                  ref={dropdownButtonRef}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={[
                        { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                        { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                        { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                        { id: "precios", name: "Precio", icon: "pricetag-outline" },
                        { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" },
                        { id: "fotos", name: "Fotos", icon: "camera-outline" }
                      ].find(tab => tab.id === activeTab)?.icon as any || 'grid-outline'}
                      size={16} // Reducido de 18 a 16
                      color="white"
                      style={{ marginRight: 6 }} // Reducido de 8 a 6
                    />
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}> {/* Reducido de 16 a 14 */}
                      {[
                        { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                        { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                        { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                        { id: "precios", name: "Precio", icon: "pricetag-outline" },
                        { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" },
                        { id: "fotos", name: "Fotos", icon: "camera-outline" }
                      ].find(tab => tab.id === activeTab)?.name || 'Seleccionar sección'}
                    </Text>
                  </View>
                  <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="white" /> {/* Reducido de 18 a 16 */}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white rounded-xl p-1.5 flex-row items-center" // Cambiado de rounded-2xl p-2 a rounded-xl p-1.5
                  onPress={() => handleViewModeChange('chips')}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                >
                  <Ionicons
                    name="grid-outline"
                    size={16} // Reducido de 18 a 16
                    color={themes.inventory.headerColor}
                  />
                  <Text style={{ color: themes.inventory.headerColor }} className="ml-1 text-xs">
                    Chips
                  </Text>
                </TouchableOpacity>
              </View>


            </View>
          )}
        </View>
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {activeTab === "ficha" && (
              <>
                {/* Text and Number Fields */}
                {textFields.map((field) => (
                  <View key={field.name} className="mb-4">
                    <View className="flex-row mb-1">
                      <Text className="text-sm font-medium text-gray-700">
                        {field.label}
                      </Text>
                      {field.required ? (
                        <Text className="text-red-600">*</Text>
                      ) : (
                        <Text className="text-gray-400"> (Opcional)</Text>
                      )}
                    </View>
                    <Controller
                      control={control}
                      name={field.name as keyof ArticuloFormData}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                            errors[field.name as keyof ArticuloFormData]
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                          placeholder={field.placeholder}
                          value={String(value || "")}
                          onChangeText={(text) => {
                            const formattedValue = getFormattedValueByType(
                              field.name,
                              field.type,
                              text,
                            );
                            onChange(formattedValue);
                          }}
                          keyboardType={getKeyboardType(field.name, field.type)}
                          returnKeyType="default"
                          autoCorrect={field.name === 'descripcion' || field.name === 'descripcionGarantia'}
                          autoCapitalize={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "sentences" : "none"}
                          selectTextOnFocus={false}
                          clearButtonMode="while-editing"
                          multiline={field.name === 'descripcion' || field.name === 'descripcionGarantia'}
                          numberOfLines={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? 4 : 1}
                          textAlignVertical={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "top" : "center"}
                          style={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? { minHeight: 100 } : {}}
                        />
                      )}
                    />
                    {field.description && (
                      <Text className="text-gray-500 text-xs mt-1">
                        {field.description}
                      </Text>
                    )}
                    {errors[field.name as keyof ArticuloFormData] && (
                      <Text className="text-red-500 text-sm mt-1">
                        {errors[field.name as keyof ArticuloFormData]?.message as string}
                      </Text>
                    )}
                  </View>
                ))}


                {/* Select Fields */}
                {selectFields.map((field) => (
                  <View key={field.name} className="mb-4">
                    <View className="flex-row mb-1">
                      <Text className="text-sm font-medium text-gray-700">
                        {field.label}
                      </Text>
                      {field.required ? (
                        <Text className="text-red-600">*</Text>
                      ) : (
                        <Text className="text-gray-400"> (Opcional)</Text>
                      )}
                    </View>
                    <Controller
                      control={control}
                      name={field.name as keyof ArticuloFormData}
                      render={({ field: { onChange, value } }) => {
                        const selectedOption = field.options?.find(
                          (opt: any) =>
                            String(opt[field.optionValue || "id"]) ===
                            String(value),
                        );

                        return (
                          <View>
                            <TouchableOpacity
                              onPress={() => handleSelectPress(field.name)}
                              className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${
                                errors[field.name as keyof ArticuloFormData]
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                            >
                              <Text className="text-gray-700">
                                {selectedOption
                                  ? String(
                                      (selectedOption as any)[field.optionLabel || "nombre"],
                                    )
                                  : "Seleccione una opción"}
                              </Text>
                              <Ionicons
                                name={
                                  openSelect === field.name
                                    ? "chevron-up"
                                    : "chevron-down"
                                }
                                size={20}
                                color="#6B7280"
                              />
                            </TouchableOpacity>

                            {openSelect === field.name && (
                              <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-48">
                                <ScrollView
                                  nestedScrollEnabled={true}
                                  className="max-h-48"
                                >
                                  {field.options?.map((option) => (
                                    <TouchableOpacity
                                      key={String((option as any)[field.optionValue || "id"])}
                                      onPress={() => {
                                        onChange((option as any)[field.optionValue || "id"]);
                                        setOpenSelect(null);
                                      }}
                                      className={`px-4 py-3 border-b border-gray-100 ${
                                        String(value) ===
                                        String((option as any)[field.optionValue || "id"])
                                          ? "bg-blue-50"
                                          : ""
                                      }`}
                                    >
                                      <Text
                                        className={`${
                                          String(value) ===
                                          String((option as any)[field.optionValue || "id"])
                                            ? "text-blue-600"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {(option as any)[field.optionLabel || "nombre"]}
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
                      <Text className="text-gray-500 text-xs mt-1">
                        {field.description}
                      </Text>
                    )}
                    {errors[field.name as keyof ArticuloFormData] && (
                      <Text className="text-red-500 text-sm mt-1">
                        {errors[field.name as keyof ArticuloFormData]?.message as string}
                      </Text>
                    )}
                  </View>
                ))}

                {/* Switch Fields */}
                {switchFields.length > 0 && (
                  <View className="bg-gray-50 rounded-lg p-4 mb-4">
                    <Text className="text-gray-800 font-medium mb-3">
                      Configuración general
                    </Text>
                    {switchFields.map((field, idx) => (
                      <View
                        key={field.name}
                        className={`flex-row w-full justify-between items-center py-2 ${
                          idx < switchFields.length - 1
                            ? "border-b border-gray-300"
                            : ""
                        }`}
                      >
                        <View className="w-3/4">
                          <Text className="text-gray-700 font-medium">
                            {field.label}
                          </Text>
                          {field.description && (
                            <Text className="text-gray-500 text-xs">
                              {field.description}
                            </Text>
                          )}
                        </View>
                        <Controller
                          control={control}
                          name={field.name as keyof ArticuloFormData}
                          render={({ field: { onChange, value } }) => (
                            <Switch
                              value={Boolean(value)}
                              onValueChange={onChange}
                              trackColor={{
                                false: "#d1d5db",
                                true: "#4b0082",
                              }}
                              thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
                            />
                          )}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {backendFormError && (
                  <View className="my-3 p-3 bg-red-100 border border-red-300 rounded-lg shadow-sm">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#c81e1e"
                      />
                      <Text className="text-red-700 text-sm ml-2 font-medium">
                        Error de Servidor
                      </Text>
                    </View>
                    <Text className="text-red-600 text-sm mt-1 ml-1">
                      {backendFormError}
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === "presentaciones" && (
              <>
                <View className="mb-6">                  
                  {/* Contador de presentaciones seleccionadas */}
                  <View className="bg-gray-50 rounded-lg p-4 mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      {presentacionesSeleccionadas.size} de {presentacionesDataArticulo?.data?.length || 0} presentaciones seleccionadas
                    </Text>
                  </View>

                  {/* Lista de todas las presentaciones disponibles */}
                  {presentacionesDataArticulo?.data?.map((presentacion) => {
                    const isSelected = presentacionesSeleccionadas.has(presentacion.id);
                    const config = presentacionesConfig[presentacion.id];

                    return (
                      <TouchableOpacity
                        key={presentacion.id}
                        onPress={() => togglePresentacionSelection(presentacion.id)}
                        className="bg-white border rounded-lg p-3 mb-3"
                        style={{
                          borderColor: isSelected ? themes.inventory.buttonColor : "#e5e7eb",
                          backgroundColor: isSelected ? `${themes.inventory.buttonColor}10` : "white"
                        }}
                      >
                        {/* Header con checkbox y nombre */}
                        <View className="flex-row items-center mb-2">
                          <View
                            className="w-5 h-5 rounded border-2 items-center justify-center mr-3"
                            style={{
                              backgroundColor: isSelected ? themes.inventory.buttonColor : "white",
                              borderColor: isSelected ? themes.inventory.buttonColor : "#d1d5db"
                            }}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={14} color="white" />
                            )}
                          </View>
                          
                          <View className="flex-1">
                            <Text className="font-semibold text-gray-800 text-base">
                              {presentacion.nombre}
                            </Text>
                          </View>
                        </View>

                        {/* Campos de configuración - solo visibles si está seleccionada */}
                        {isSelected && config && (
                          <View className="space-y-3 border-t border-gray-200 pt-3">
                            {/* Equivalencia */}
                            <View>
                              <Text className="text-sm font-medium text-gray-700 mb-1">
                                Equivalencia
                              </Text>
                              <TextInput
                                className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300"
                                placeholder="1"
                                value={String(config.equivalencia)}
                                onChangeText={(value) => 
                                  updatePresentacionConfig(presentacion.id, "equivalencia", value)
                                }
                                keyboardType="numeric"
                              />
                            </View>

                            {/* Switches de configuración */}
                            <View className="space-y-1">
                              {/* Es Principal */}
                              <View className="flex-row justify-between items-center py-1 px-2 bg-gray-50 rounded-md">
                                <View className="flex-1">
                                  <Text className="text-xs font-medium text-gray-700">
                                    Es Principal
                                  </Text>
                                </View>
                                <Switch
                                  value={config.esPrincipal}
                                  onValueChange={(value) => 
                                    updatePresentacionConfig(presentacion.id, "esPrincipal", value)
                                  }
                                  trackColor={{ false: "#d1d5db", true: themes.inventory.buttonColor }}
                                  thumbColor="#f4f3f4"
                                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                              </View>
                              
                              {/* Usar en Ventas */}
                              <View className="flex-row justify-between items-center py-1 px-2 bg-gray-50 rounded-md">
                                <View className="flex-1">
                                  <Text className="text-xs font-medium text-gray-700">
                                    Usar en Ventas
                                  </Text>
                                </View>
                                <Switch
                                  value={config.usarEnVentas}
                                  onValueChange={(value) => 
                                    updatePresentacionConfig(presentacion.id, "usarEnVentas", value)
                                  }
                                  trackColor={{ false: "#d1d5db", true: themes.inventory.buttonColor }}
                                  thumbColor="#f4f3f4"
                                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                              </View>
                              
                              {/* Usar en Compras */}
                              <View className="flex-row justify-between items-center py-1 px-2 bg-gray-50 rounded-md">
                                <View className="flex-1">
                                  <Text className="text-xs font-medium text-gray-700">
                                    Usar en Compras
                                  </Text>
                                </View>
                                <Switch
                                  value={config.usarEnCompras}
                                  onValueChange={(value) => 
                                    updatePresentacionConfig(presentacion.id, "usarEnCompras", value)
                                  }
                                  trackColor={{ false: "#d1d5db", true: themes.inventory.buttonColor }}
                                  thumbColor="#f4f3f4"
                                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                              </View>
                            </View>
                          </View>
                        )}

                      </TouchableOpacity>
                    );
                  })}

                  {(!presentacionesDataArticulo?.data || presentacionesDataArticulo.data.length === 0) && (
                    <View className="bg-gray-50 rounded-lg p-8">
                      <Ionicons name="layers-outline" size={48} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2 text-center">
                        No hay presentaciones disponibles
                      </Text>
                      <Text className="text-gray-400 text-sm text-center mt-1">
                        Primero debe crear presentaciones en el catálogo
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === "detalles" && (
              <>
                <View className="mb-6">
                  <Text className="text-lg font-medium text-gray-800 mb-4">
                    Detalle del Producto
                  </Text>
                  
                  {/* Text and Number Fields */}
                  {textFields.map((field) => (
                    <View key={field.name} className="mb-4">
                      <View className="flex-row mb-1">
                        <Text className="text-sm font-medium text-gray-700">
                          {field.label}
                        </Text>
                        {field.required ? (
                          <Text className="text-red-600">*</Text>
                        ) : (
                          <Text className="text-gray-400"> (Opcional)</Text>
                        )}
                      </View>
                      <Controller
                        control={control}
                        name={field.name as keyof ArticuloFormData}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                              errors[field.name as keyof ArticuloFormData]
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                            placeholder={field.placeholder}
                            value={String(value || "")}
                            onChangeText={(text) => {
                              const formattedValue = getFormattedValueByType(
                                field.name,
                                field.type,
                                text,
                              );
                              onChange(formattedValue);
                            }}
                            keyboardType={getKeyboardType(field.name, field.type)}
                            returnKeyType="default"
                            autoCorrect={field.name === 'descripcion' || field.name === 'descripcionGarantia'}
                            autoCapitalize={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "sentences" : "none"}
                            selectTextOnFocus={false}
                            clearButtonMode="while-editing"
                            multiline={field.name === 'descripcion' || field.name === 'descripcionGarantia'}
                            numberOfLines={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? 4 : 1}
                            textAlignVertical={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "top" : "center"}
                            style={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? { minHeight: 100 } : {}}
                          />
                        )}
                      />
                      {field.description && (
                        <Text className="text-gray-500 text-xs mt-1">
                          {field.description}
                        </Text>
                      )}
                      {errors[field.name as keyof ArticuloFormData] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof ArticuloFormData]?.message as string}
                        </Text>
                      )}
                    </View>
                  ))}

                  {/* Select Fields */}
                  {selectFields.map((field) => (
                    <View key={field.name} className="mb-4">
                      <View className="flex-row mb-1">
                        <Text className="text-sm font-medium text-gray-700">
                          {field.label}
                        </Text>
                        {field.required ? (
                          <Text className="text-red-600">*</Text>
                        ) : (
                          <Text className="text-gray-400"> (Opcional)</Text>
                        )}
                      </View>
                      <Controller
                        control={control}
                        name={field.name as keyof ArticuloFormData}
                        render={({ field: { onChange, value } }) => {
                          const selectedOption = field.options?.find(
                            (opt: any) =>
                              String(opt[field.optionValue || "id"]) ===
                              String(value),
                          );

                          return (
                            <View>
                              <TouchableOpacity
                                onPress={() => handleSelectPress(field.name)}
                                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${
                                  errors[field.name as keyof ArticuloFormData]
                                    ? "border-red-500"
                                    : "border-gray-200"
                                }`}
                              >
                                <Text className="text-gray-700">
                                  {selectedOption
                                    ? String(
                                        (selectedOption as any)[field.optionLabel || "nombre"],
                                      )
                                    : "Seleccione una opción"}
                                </Text>
                                <Ionicons
                                  name={
                                    openSelect === field.name
                                      ? "chevron-up"
                                      : "chevron-down"
                                  }
                                  size={20}
                                  color="#6B7280"
                                />
                              </TouchableOpacity>

                              {openSelect === field.name && (
                                <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-48">
                                  <ScrollView
                                    nestedScrollEnabled={true}
                                    className="max-h-48"
                                  >
                                    {field.options?.map((option) => (
                                      <TouchableOpacity
                                        key={String((option as any)[field.optionValue || "id"])}
                                        onPress={() => {
                                          onChange((option as any)[field.optionValue || "id"]);
                                          setOpenSelect(null);
                                        }}
                                        className={`px-4 py-3 border-b border-gray-100 ${
                                          String(value) ===
                                          String((option as any)[field.optionValue || "id"])
                                            ? "bg-blue-50"
                                            : ""
                                        }`}
                                      >
                                        <Text
                                          className={`${
                                            String(value) ===
                                            String((option as any)[field.optionValue || "id"])
                                              ? "text-blue-600"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {(option as any)[field.optionLabel || "nombre"]}
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
                        <Text className="text-gray-500 text-xs mt-1">
                          {field.description}
                        </Text>
                      )}
                      {errors[field.name as keyof ArticuloFormData] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof ArticuloFormData]?.message as string}
                        </Text>
                      )}
                    </View>
                  ))}

                  {/* Switch Fields */}
                  {switchFields.length > 0 && (
                    <View className="bg-gray-50 rounded-lg p-4 mb-4">
                      <Text className="text-gray-800 font-medium mb-3">
                        Configuración de detalles
                      </Text>
                      {switchFields.map((field, idx) => (
                        <View
                          key={field.name}
                          className={`flex-row w-full justify-between items-center py-2 ${
                            idx < switchFields.length - 1
                              ? "border-b border-gray-300"
                              : ""
                          }`}
                        >
                          <View className="w-3/4">
                            <Text className="text-gray-700 font-medium">
                              {field.label}
                            </Text>
                            {field.description && (
                              <Text className="text-gray-500 text-xs">
                                {field.description}
                              </Text>
                            )}
                          </View>
                          <Controller
                            control={control}
                            name={field.name as keyof ArticuloFormData}
                            render={({ field: { onChange, value } }) => (
                              <Switch
                                value={Boolean(value)}
                                onValueChange={onChange}
                                trackColor={{
                                  false: "#d1d5db",
                                  true: "#4b0082",
                                }}
                                thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
                              />
                            )}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === "precios" && (
              <>
                {/* Price Lists Section */}
                <View className="mb-6">
                  <Text className="text-lg font-medium text-gray-800 mb-4">
                    Lista de Precio
                  </Text>
                  
                  {/* Form for price list */}
                  <View className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                    {/* Lista de Precio */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Lista de Precio
                      </Text>
                      <View className="relative">
                        <TouchableOpacity
                          onPress={() => setOpenSelect("listaPrecio")}
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                        >
                          <Text className="text-gray-700">
                            {selectedListaPrecio
                              ? listasPreciosData?.data.find(
                                  (l) => l.id === Number(selectedListaPrecio),
                                )?.nombre
                              : "Seleccione una lista de precio"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>

                        {openSelect === "listaPrecio" && (
                          <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                            <ScrollView nestedScrollEnabled={true} className="max-h-32">
                              {listasPreciosData?.data.map((lista) => (
                                <TouchableOpacity
                                  key={lista.id}
                                  onPress={() => {
                                    setSelectedListaPrecio(String(lista.id));
                                    setOpenSelect(null);
                                  }}
                                  className="px-4 py-3 border-b border-gray-100"
                                >
                                  <Text className="text-gray-700">
                                    {lista.nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Moneda */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Moneda
                      </Text>
                      <View className="relative">
                        <TouchableOpacity
                          onPress={() => setOpenSelect("moneda")}
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                        >
                          <Text className="text-gray-700">
                            {selectedMoneda
                              ? monedasData?.data.find(
                                  (m) => m.id === Number(selectedMoneda),
                                )?.nombre
                              : "Seleccione una moneda"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>

                        {openSelect === "moneda" && (
                          <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                            <ScrollView nestedScrollEnabled={true} className="max-h-32">
                              {monedasData?.data.map((moneda) => (
                                <TouchableOpacity
                                  key={moneda.id}
                                  onPress={() => {
                                    setSelectedMoneda(String(moneda.id));
                                    setOpenSelect(null);
                                  }}
                                  className="px-4 py-3 border-b border-gray-100"
                                >
                                  <Text className="text-gray-700">
                                    {moneda.nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Monto */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Monto
                      </Text>
                      <TextInput
                        className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                        placeholder="0.00"
                        value={precioInputs.monto}
                        onChangeText={(text) =>
                          setPrecioInputs((prev: PrecioInputs) => ({
                            ...prev,
                            monto: text,
                          }))
                        }
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Fechas */}
                    <View className="space-y-4">
                      {/* Fecha Desde */}
                      <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Fecha Desde
                        </Text>
                        <View className="flex-row items-center space-x-2">
                          <TextInput
                            className="flex-1 px-4 py-3 bg-white rounded-lg border border-gray-200"
                            placeholder="DD/MM/YYYY"
                            value={precioInputs.fechaDesde}
                            onChangeText={(text) => {
                              // Solo permite números y barras
                              const numericText = text.replace(/[^0-9]/g, '');
                              let formattedText = '';
                              
                              // Auto-formateo con barras
                              if (numericText.length <= 2) {
                                formattedText = numericText;
                              } else if (numericText.length <= 4) {
                                formattedText = numericText.slice(0, 2) + '/' + numericText.slice(2);
                              } else if (numericText.length <= 8) {
                                formattedText = numericText.slice(0, 2) + '/' + numericText.slice(2, 4) + '/' + numericText.slice(4, 8);
                              }
                              
                              if (formattedText.length <= 10) {
                                setPrecioInputs((prev: PrecioInputs) => ({
                                  ...prev,
                                  fechaDesde: formattedText,
                                }));
                              }
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              setShowPrecioDatePicker((prev) => ({
                                ...prev,
                                fechaDesde: true,
                              }))
                            }
                            className="p-2"
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={24}
                              color={themes.inventory.buttonColor}
                            />
                          </TouchableOpacity>
                        </View>
                        {showPrecioDatePicker.fechaDesde && (
                          <DateTimePicker
                            value={(() => {
                              if (precioInputs.fechaDesde) {
                                const [day, month, year] = precioInputs.fechaDesde.split('/');
                                if (day && month && year && year.length === 4) {
                                  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                }
                              }
                              return new Date();
                            })()}
                            mode="date"
                            display={Platform.OS === "ios" ? "compact" : "default"}
                            onChange={(event: any, selectedDate: Date | undefined) => {
                              if (event.type === 'dismissed') {
                                setShowPrecioDatePicker((prev) => ({
                                  ...prev,
                                  fechaDesde: false,
                                }));
                                return;
                              }
                              
                              if (selectedDate) {
                                const day = selectedDate.getDate().toString().padStart(2, '0');
                                const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                                const year = selectedDate.getFullYear().toString();
                                const formattedDate = `${year}/${month}/${day}`;
                                
                                setPrecioInputs((prev: PrecioInputs) => ({
                                  ...prev,
                                  fechaDesde: formattedDate,
                                }));
                                
                                if (Platform.OS === 'android') {
                                  setShowPrecioDatePicker((prev) => ({
                                    ...prev,
                                    fechaDesde: false,
                                  }));
                                }
                              }
                            }}
                          />
                        )}
                      </View>
                      
                      {/* Fecha Hasta */}
                      <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Fecha Hasta (Opcional)
                        </Text>
                        <View className="flex-row items-center space-x-2">
                          <TextInput
                            className="flex-1 px-4 py-3 bg-white rounded-lg border border-gray-200"
                            placeholder="DD/MM/YYYY"
                            value={precioInputs.fechaHasta}
                            onChangeText={(text) => {
                              // Solo permite números y barras
                              const numericText = text.replace(/[^0-9]/g, '');
                              let formattedText = '';
                              
                              // Auto-formateo con barras
                              if (numericText.length <= 2) {
                                formattedText = numericText;
                              } else if (numericText.length <= 4) {
                                formattedText = numericText.slice(0, 2) + '/' + numericText.slice(2);
                              } else if (numericText.length <= 8) {
                                formattedText = numericText.slice(0, 2) + '/' + numericText.slice(2, 4) + '/' + numericText.slice(4, 8);
                              }
                              
                              if (formattedText.length <= 10) {
                                setPrecioInputs((prev: PrecioInputs) => ({
                                  ...prev,
                                  fechaHasta: formattedText,
                                }));
                              }
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              setShowPrecioDatePicker((prev) => ({
                                ...prev,
                                fechaHasta: true,
                              }))
                            }
                            className="p-2"
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={24}
                              color={themes.inventory.buttonColor}
                            />
                          </TouchableOpacity>
                        </View>
                        {showPrecioDatePicker.fechaHasta && (
                          <DateTimePicker
                            value={(() => {
                              if (precioInputs.fechaHasta) {
                                const [day, month, year] = precioInputs.fechaHasta.split('/');
                                if (day && month && year && year.length === 4) {
                                  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                }
                              }
                              return new Date();
                            })()}
                            mode="date"
                            display={Platform.OS === "ios" ? "compact" : "default"}
                            onChange={(event: any, selectedDate: Date | undefined) => {
                              if (event.type === 'dismissed') {
                                setShowPrecioDatePicker((prev) => ({
                                  ...prev,
                                  fechaHasta: false,
                                }));
                                return;
                              }
                              
                              if (selectedDate) {
                                const day = selectedDate.getDate().toString().padStart(2, '0');
                                const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                                const year = selectedDate.getFullYear().toString();
                                const formattedDate = `${year}/${month}/${day}`;
                                
                                setPrecioInputs((prev: PrecioInputs) => ({
                                  ...prev,
                                  fechaHasta: formattedDate,
                                }));
                                
                                if (Platform.OS === 'android') {
                                  setShowPrecioDatePicker((prev) => ({
                                    ...prev,
                                    fechaHasta: false,
                                  }));
                                }
                              }
                            }}
                          />
                        )}
                      </View>
                    </View>

                    {/* Add Button */}
                    <View className="flex-row justify-end items-center mt-4">
                      <TouchableOpacity
                        onPress={addListaPrecio}
                        disabled={
                          !precioInputs.monto ||
                          !precioInputs.fechaDesde ||
                          !selectedListaPrecio ||
                          !selectedMoneda
                        }
                        className={`flex-row items-center space-x-2 py-2 px-4 rounded-lg ${
                          !precioInputs.monto ||
                          !precioInputs.fechaDesde ||
                          !selectedListaPrecio ||
                          !selectedMoneda
                            ? "bg-gray-100"
                            : "bg-blue-500"
                        }`}
                      >
                        <Ionicons
                          name="add-circle"
                          size={20}
                          color={
                            !precioInputs.monto ||
                            !precioInputs.fechaDesde ||
                            !selectedListaPrecio ||
                            !selectedMoneda
                              ? "#9CA3AF"
                              : "#FFFFFF"
                          }
                        />
                        <Text
                          className={`text-sm font-medium ${
                            !precioInputs.monto ||
                            !precioInputs.fechaDesde ||
                            !selectedListaPrecio ||
                            !selectedMoneda
                              ? "text-gray-400"
                              : "text-white"
                          }`}
                        >
                          Agregar Precio
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* List of Added Prices */}
                  {listasPrecios.map((precio, index) => (
                    <View
                      key={precio.id || `precio-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 mb-2"
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="font-medium">
                            {listasPreciosData?.data.find(
                              (l) => l.id === Number(precio.idListasdePrecio),
                            )?.nombre || "Lista de Precio"}
                          </Text>
                          <Text className="text-gray-600">
                            {monedasData?.data.find(
                              (m) => m.id === Number(precio.idMoneda),
                            )?.nombre || "Moneda"}
                          </Text>
                          <Text className="font-bold text-lg">
                            {Number(precio.monto).toFixed(2)}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {precio.fechaDesde}{" "}
                            {precio.fechaHasta ? `- ${precio.fechaHasta}` : ""}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeListaPrecio(precio.id)}
                          className="p-2"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  
                </View>
              </>
            )}

            {activeTab === "ubicaciones" && (
              <>
                {/* Location Section */}
                <View className="mt-4 mb-6">
                  <Text className="text-lg font-medium text-gray-800 mb-4">
                    Ubicaciones en Almacén
                  </Text>
                  
                  {/* Form for location */}
                  <View className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                    {/* Almacén */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Almacén
                      </Text>
                      <View className="relative">
                        <TouchableOpacity
                          onPress={() => setOpenSelect("almacen")}
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 flex-row justify-between items-center"
                        >
                          <Text className="text-gray-700">
                            {selectedAlmacen
                              ? almacenesData?.data.find(
                                  (a) => a.id === Number(selectedAlmacen),
                                )?.nombre
                              : "Seleccione un almacén"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>

                        {openSelect === "almacen" && (
                          <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-32">
                            <ScrollView nestedScrollEnabled={true} className="max-h-32">
                              {almacenesData?.data.map((almacen) => (
                                <TouchableOpacity
                                  key={almacen.id}
                                  onPress={() => {
                                    setSelectedAlmacen(String(almacen.id));
                                    setOpenSelect(null);
                                  }}
                                  className="px-4 py-3 border-b border-gray-100"
                                >
                                  <Text className="text-gray-700">
                                    {almacen.nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Ubicación */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Ubicación Específica
                      </Text>
                      <TextInput
                        className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                        placeholder="Ej: Pasillo A, Estante 3, Nivel 2"
                        value={ubicacionInput}
                        onChangeText={setUbicacionInput}
                      />
                    </View>

                    {/* Add Location Button */}
                    <View className="flex-row justify-end items-center mt-4">
                      <TouchableOpacity
                        onPress={addUbicacion}
                        disabled={!selectedAlmacen || !ubicacionInput}
                        className={`flex-row items-center space-x-2 py-2 px-4 rounded-lg ${
                          !selectedAlmacen || !ubicacionInput
                            ? "bg-gray-100"
                            : "bg-blue-500"
                        }`}
                      >
                        <Ionicons
                          name="add-circle"
                          size={20}
                          color={
                            !selectedAlmacen || !ubicacionInput
                              ? "#9CA3AF"
                              : "#FFFFFF"
                          }
                        />
                        <Text
                          className={`text-sm font-medium ${
                            !selectedAlmacen || !ubicacionInput
                              ? "text-gray-400"
                              : "text-white"
                          }`}
                        >
                          Agregar Ubicación
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* List of locations */}
                  {ubicaciones.map((ubicacion, index) => (
                    <View
                      key={ubicacion.id || `ubicacion-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 mb-2"
                    >
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="font-medium">
                            {almacenesData?.data.find(
                              (a) => a.id === Number(ubicacion.codigoAlmacen),
                            )?.nombre || "Almacén no seleccionado"}
                          </Text>
                          <Text className="text-gray-600 mt-1">
                            {ubicacion.ubicacion || "Sin ubicación específica"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeUbicacion(index)}
                          className="p-2"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {activeTab === "fotos" && (
              <>
                {/* Photos Section - Optimized */}
                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-medium text-gray-800">
                      Fotos
                    </Text>
                    <View className="flex-row items-center">
                      {selectedImages.length > 1 && (
                        <TouchableOpacity
                          onPress={toggleOrderMode}
                          className={`px-3 py-1 rounded-lg flex-row items-center mr-2 ${
                            isOrderMode ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        >
                          <Ionicons
                            name="swap-vertical"
                            size={16}
                            color={isOrderMode ? 'white' : '#6B7280'}
                          />
                          <Text className={`ml-1 text-sm font-medium ${
                            isOrderMode ? 'text-white' : 'text-gray-700'
                          }`}>
                            {isOrderMode ? 'Cancelar' : 'Orden'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedImages.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setShowImagePickerModal(true)}
                          className="px-3 py-1 rounded-lg bg-blue-500 flex-row items-center"
                        >
                          <Ionicons
                            name="camera-outline"
                            size={16}
                            color="white"
                          />
                          <Text className="ml-1 text-sm font-medium text-white">
                            Agregar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  
                  {/* Instrucciones para modo ordenamiento */}
                  {isOrderMode && selectedImages.length > 0 && (
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={16} color="#2563EB" />
                        <Text className="text-blue-800 text-sm ml-2 flex-1">
                          Toca las fotos en el orden que desees. La primera será la principal.
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedImages.length === 0 ? (
                    <>
                      {/* Empty state */}
                      <TouchableOpacity
                        onPress={() => setShowImagePickerModal(true)}
                        className="w-full py-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
                      >
                        <Ionicons
                          name="camera-outline"
                          size={48}
                          color="#6B7280"
                        />
                        <Text className="text-gray-600 font-medium mt-3">
                          Agregar Foto
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          Toca para tomar foto o seleccionar de galería
                        </Text>
                      </TouchableOpacity>

                      <View className="p-4 bg-gray-50 rounded-lg">
                        <Text className="text-gray-500 text-center text-sm">
                          No hay fotos seleccionadas. Toca el botón superior
                          para agregar la primera imagen.
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      {/* Grid de imágenes optimizado - 2 columnas */}
                      <View className="flex-row flex-wrap">
                        {selectedImages.map((image, index) => {
                          const order = imageOrder[image.id] || 0;
                          const isPrincipal = order === 1;
                          const isSelectedForDelete = selectedImageForDelete === index;
                          
                          return (
                            <View
                              key={image.id || `image-${index}`}
                              className="w-[48%] mb-4"
                              style={{
                                marginRight: index % 2 === 1 ? 0 : '4%'
                              }}
                            >
                              <TouchableOpacity
                                onLongPress={() => handleImageLongPress(index)}
                                onPress={() => {
                                  if (isOrderMode) {
                                    // En modo ordenamiento, asignar orden secuencial
                                    handleOrderSelection(image.id);
                                  }
                                }}
                                activeOpacity={0.8}
                              >
                                <View className={`relative w-full aspect-square rounded-xl overflow-hidden ${
                                  isPrincipal ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                                } ${isSelectedForDelete ? 'ring-2 ring-red-500 ring-offset-2' : ''} ${
                                  isOrderMode && !order ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                                }`}>
                                  {/* Image */}
                                  <Image
                                    source={{ uri: image.uri }}
                                    className="w-full h-full"
                                    contentFit="cover"
                                  />

                                  {/* Order Number Badge - Solo visible cuando no está en modo ordenamiento */}
                                  {!isOrderMode && (
                                    <View className={`absolute top-1 left-1 w-6 h-6 rounded-full items-center justify-center shadow-lg z-10 ${
                                      isPrincipal ? "bg-yellow-500" : "bg-blue-500"
                                    }`}>
                                      <Text className="text-white text-xs font-bold">
                                        {order || '#'}
                                      </Text>
                                    </View>
                                  )}

                                  {/* Principal indicator - Marco dorado en lugar de texto */}
                                  {isPrincipal && (
                                    <View className="absolute inset-0 border-2 border-yellow-400 rounded-xl" />
                                  )}

                                  {/* Indicador de orden en modo ordenamiento */}
                                  {isOrderMode && order && (
                                    <View className="absolute top-1 left-1 w-6 h-6 bg-green-500 rounded-full items-center justify-center shadow-lg z-10">
                                      <Text className="text-white text-xs font-bold">
                                        {order}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>

                    </>
                  )}
                </View>
              </>
            )}

            {/* Modal de confirmación de eliminación - Global */}
            {showDeleteModal && (
              <TouchableOpacity 
                className="absolute inset-0 items-center justify-center z-50" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0,
                  width: '100%',
                  height: '100%'
                }}
                activeOpacity={1}
                onPress={cancelDeleteImage}
              >
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View className="bg-white rounded-xl p-6 mx-6 max-w-sm" style={{ 
                    elevation: 30,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 30
                  }}>
                    <View className="items-center mb-4">
                      <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-3">
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                      </View>
                      <Text className="text-xl font-bold text-gray-800 text-center">
                        ¿Eliminar foto?
                      </Text>
                      <Text className="text-gray-600 text-center mt-2">
                        Esta acción no se puede deshacer.
                      </Text>
                    </View>
                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={cancelDeleteImage}
                        className="flex-1 bg-gray-100 py-3 rounded-lg"
                      >
                        <Text className="text-gray-700 text-center font-semibold">
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={confirmDeleteImage}
                        className="flex-1 bg-red-500 py-3 rounded-lg"
                      >
                        <Text className="text-white text-center font-semibold">
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            </View>
        </ScrollView>

        {/* Footer Buttons - Changed to Cancel/Save */}
        <View className="bg-white border-t border-gray-200 px-6 py-2 shadow-lg">
          <View className="flex-row space-x-4">
            {/* Cancel Button */}
            <TouchableOpacity
              className="flex-1 bg-gray-100 py-2 rounded-xl flex-row justify-center items-center"
              onPress={() => {
              navigateBack();
            }}
              disabled={isSubmitting}
            >
              <Ionicons
                name="close-outline"
                size={20}
                color="#6B7280"
              />
              <Text className="text-gray-700 font-semibold ml-2">
                Cancelar
              </Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={{ backgroundColor: themes.inventory.buttonColor }}
              className={`flex-1 py-3 rounded-xl flex-row justify-center items-center shadow-sm ${
                isSubmitting ? "opacity-70" : ""
              }`}
              onPress={() => {
                console.log('🔘 Botón presionado. ActiveTab:', activeTab, 'isEditingMode:', isEditingMode);
                console.log('📊 Errores actuales:', errors);
                if(activeTab === "ficha"){
                  console.log('📝 Ejecutando handleSubmit para ficha...');
                  handleSubmit(onSubmit)();
                } else if(activeTab === "detalles"){
                  console.log('📝 Ejecutando handleSubmit para detalles...');
                  handleSubmit(onSubmit)();
                } else {
                  // Para presentaciones, precios, ubicaciones, fotos - no necesitamos datos del formulario
                  console.log('📝 Ejecutando onSubmit directo...');
                  onSubmit({});
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons
                  name="refresh"
                  size={20}
                  color={themes.inventory.buttonTextColor}
                  style={{ 
                    transform: [{ rotate: isSubmitting ? '360deg' : '0deg' }]
                  }}
                />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={20}
                  color={themes.inventory.buttonTextColor}
                />
              )}
              <Text
                style={{ color: themes.inventory.buttonTextColor }}
                className="font-semibold ml-2"
              >
                {isSubmitting 
                  ? (isEditingMode ? "Actualizando..." : "Guardando...") 
                  : (isEditingMode ? "Actualizar" : "Guardar")
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal for FICHA tab */}
      <Modal
        transparent
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-center text-gray-800">
                {(() => {
                  if (activeTab === "ficha") {
                    return `¡Artículo ${isEditingMode ? 'Actualizado' : 'Creado'} Exitosamente!`;
                  } else if (activeTab === "presentaciones") {
                    return `¡Presentaciones ${isEditingMode ? 'Actualizadas' : 'Creadas'} Exitosamente!`;
                  } else if (activeTab === "detalles") {
                    return `¡Detalles ${isEditingMode ? 'Actualizados' : 'Creados'} Exitosamente!`;
                  } else if (activeTab === "precios") {
                    return `¡Precios ${isEditingMode ? 'Actualizados' : 'Creados'} Exitosamente!`;
                  } else if (activeTab === "ubicaciones") {
                    return `¡Ubicaciones ${isEditingMode ? 'Actualizadas' : 'Creadas'} Exitosamente!`;
                  } else if (activeTab === "fotos") {
                    return `¡Fotos ${isEditingMode ? 'Actualizadas' : 'Creadas'} Exitosamente!`;
                  }
                  return `¡Información ${isEditingMode ? 'Actualizada' : 'Creada'} Exitosamente!`;
                })()}
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                ¿Desea continuar agregando información al artículo?
              </Text>
            </View>

            <View className="flex-row space-x-3">
              {/* No, salir */}
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  navigateBack();
                }}
                className="flex-1 bg-gray-100 py-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-medium">
                  No, Salir
                </Text>
              </TouchableOpacity>

              {/* Sí, continuar */}
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  // Navegar a la siguiente pestaña según el tab actual
                  if (activeTab === "ficha") {
                    setActiveTab("presentaciones");
                  } else if (activeTab === "presentaciones") {
                    setActiveTab("detalles");
                  } else if (activeTab === "detalles") {
                    setActiveTab("precios");
                  } else if (activeTab === "precios") {
                    setActiveTab("ubicaciones");
                  } else if (activeTab === "ubicaciones") {
                    setActiveTab("fotos");
                  } else {
                    // Si estamos en fotos o cualquier otro tab, salir
                    navigateBack();
                  }
                }}
                style={{ backgroundColor: themes.inventory.buttonColor }}
                className="flex-1 py-3 rounded-lg"
              >
                <Text 
                  style={{ color: themes.inventory.buttonTextColor }}
                  className="text-center font-medium"
                >
                  Sí, Continuar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
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

            {/* Camera Option */}
            <TouchableOpacity
              onPress={takePhotoWithCamera}
              className="flex-row items-center p-4 bg-blue-50 rounded-lg mb-3"
            >
              <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Tomar Foto
                </Text>
                <Text className="text-sm text-gray-600">
                  Usar la cámara para tomar una nueva foto
                </Text>
              </View>
            </TouchableOpacity>

            {/* Gallery Option */}
            <TouchableOpacity
              onPress={pickImageFromGallery}
              className="flex-row items-center p-4 bg-green-50 rounded-lg mb-6"
            >
              <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                <Ionicons name="images" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Galería
                </Text>
                <Text className="text-sm text-gray-600">
                  Seleccionar una imagen existente
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowImagePickerModal(false)}
              className="bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dropdown Overlay */}
      <DropdownOverlay
        isVisible={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        options={[
          { id: "ficha", name: "Ficha", icon: "document-text-outline" },
          { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
          { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
          { id: "precios", name: "Precios", icon: "pricetag-outline" },
          { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" },
          { id: "fotos", name: "Fotos", icon: "camera-outline" }
        ]}
        activeOption={activeTab}
        onSelectOption={setActiveTab}
        position={dropdownPosition}
        theme={themes.inventory}
      />
    </View>
  );
};

export default ArticuloForm;