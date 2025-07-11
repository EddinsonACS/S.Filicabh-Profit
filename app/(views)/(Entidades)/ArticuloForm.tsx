import { useAlmacen } from "@/hooks/Inventario/useAlmacen";
import { useArticuloFoto } from "@/hooks/Inventario/useArticuloFoto";
import { useArticuloListaDePrecio } from "@/hooks/Inventario/useArticuloListaDePrecio";
import { useArticuloUbicacion } from "@/hooks/Inventario/useArticuloUbicacion";
import { useArticulo } from "@/hooks/Inventario/useArticulo";
import { useColor } from "@/hooks/Inventario/useColor";
import { useGrupo } from "@/hooks/Inventario/useGrupo";
import { useTalla } from "@/hooks/Inventario/useTalla";
import { useTipoDeArticulo } from "@/hooks/Inventario/useTipoDeArticulo";
import { useTipoDeImpuesto } from "@/hooks/Inventario/useTipoDeImpuesto";
import { usePresentacion } from "@/hooks/Inventario/usePresentacion";
import { useListaDePrecio } from "@/hooks/Ventas/useListaDePrecio";
import { useMoneda } from "@/hooks/Ventas/useMoneda";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { themes } from "@/components/Entidades/shared/theme";
import { DEFAULT_VALUES_INVENTORY } from "@/utils/const/defaultValues";
import { FORM_FIELDS_INVENTORY } from "@/utils/const/formFields";
import { inventorySchema } from "@/utils/schemas/inventorySchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Articulo } from "@/core/models/Inventario/Articulo";

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

const ArticuloForm: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, isEditing } = useLocalSearchParams<{ id?: string; isEditing?: string }>();
  
  const [activeTab, setActiveTab] = useState("ficha");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [imageOrder, setImageOrder] = useState<{[key: number]: number}>({});
  const [principalImageIndex, setPrincipalImageIndex] = useState<number>(-1);
  const [listasPrecios, setListasPrecios] = useState<ListaPrecioItem[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<string>("");
  const [selectedMoneda, setSelectedMoneda] = useState<string>("");
  const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{[key: string]: boolean}>({});
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>("");
  const [ubicacionInput, setUbicacionInput] = useState<string>("");
  const [precioInputs, setPrecioInputs] = useState<PrecioInputs>({
    monto: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [backendFormError, setBackendFormError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
  const { useCreateArticuloFoto } = useArticuloFoto();
  const { useCreateArticuloListaDePrecio, useGetArticuloListaDePrecioList } = useArticuloListaDePrecio();
  const { useCreateArticuloUbicacion,useGetArticuloUbicacionList } = useArticuloUbicacion();

  // Data queries
  const { data: gruposDataArticulo } = useGetGrupoList(1, 1000);
  const { data: coloresDataArticulo } = useGetColorList(1, 1000);
  const { data: tallasDataArticulo } = useGetTallaList(1, 1000);
  const { data: listasPreciosDataArticulo } = useGetArticuloListaDePrecioList(1, 100);
  const { data: ubicacionesDataArticulo } = useGetArticuloUbicacionList(1, 100);
  const { data: tiposArticuloDataArticulo } = useGetTipoDeArticuloList(1, 1000);
  const { data: impuestosDataArticulo } = useGetTipoDeImpuestoList(1, 1000);
  const { data: presentacionesDataArticulo } = useGetPresentacionList(1, 1000);
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
  const createPrecioMutation = useCreateArticuloListaDePrecio();
  const createUbicacionMutation = useCreateArticuloUbicacion();

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Partial<Articulo>>({
    resolver: zodResolver(inventorySchema['articulo']),
    defaultValues: isEditingMode ? (currentItem as Partial<Articulo>) : DEFAULT_VALUES_INVENTORY['articulo'],
  });

  useEffect(() => {
    if (isEditingMode && currentItem) {
      reset(currentItem as Partial<Articulo>);
      // Inicializar presentaciones si existen
      if (currentItem.presentaciones) {
        const presentacionesArray = Array.isArray(currentItem.presentaciones)
          ? currentItem.presentaciones.map(Number)
          : [Number(currentItem.presentaciones)];
        setValue("presentaciones", presentacionesArray as any);
      }
      // Inicializar otros campos numéricos
      [
        "peso", "volumen", "metroCubico", "pie", "puntoMinimo", "puntoMaximo",
      ].forEach((field) => {
        if ((currentItem as any)[field] !== undefined) {
          setValue(field as keyof Articulo, Number((currentItem as any)[field]) as any);
        }
      });
      // Inicializar campos booleanos
      [
        "manejaLote", "manejaSerial", "poseeGarantia", "manejaPuntoMinimo", "manejaPuntoMaximo", "suspendido",
      ].forEach((field) => {
        if ((currentItem as any)[field] !== undefined) {
          setValue(field as keyof Articulo, Boolean((currentItem as any)[field]) as any);
        }
      });
    } else {
      reset(DEFAULT_VALUES_INVENTORY['articulo'] as Partial<Articulo>);
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
    if (!result.canceled) {
      const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;
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
        uri: result.assets[0].uri,
        name: fileName,
        type: mimeType,
        file: {
          ...result.assets[0],
          type: mimeType,
        },
      };
      setSelectedImages((prev) => [...prev, newImage]);
      
      // Auto-assign next available order
      const nextOrder = getNextAvailableOrder();
      setImageOrder(prev => ({
        ...prev,
        [newImage.id]: nextOrder
      }));
    }
  };

  const pickImageFromGallery = async () => {
    setShowImagePickerModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    processSelectedImage(result);
  };

  const takePhotoWithCamera = async () => {
    setShowImagePickerModal(false);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    processSelectedImage(result);
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
    if (selectedImages.length === 0) return true;

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const order = imageOrder[image.id] || i + 1;
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
        formData.append("idArticulo", String(articleId));
        formData.append("esPrincipal", String(order === 1));
        formData.append("orden", String(order));

        await createFotoMutation.mutateAsync(formData);
      }
      return true;
    } catch (error) {
      console.error("Error al subir fotos:", error);
      return false;
    }
  };

  const saveListasPrecios = async (articleId: number): Promise<boolean> => {
    if (listasPrecios.length === 0) return true;

    try {
      for (const precio of listasPrecios) {
        const precioData = {
          idArticulo: articleId,
          idListasDePrecio: Number(precio.idListasdePrecio),
          idMoneda: Number(precio.idMoneda),
          monto: Number(precio.monto),
          fechaDesde: precio.fechaDesde,
          fechaHasta: precio.fechaHasta,
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
    if (ubicaciones.length === 0) return true;

    try {
      for (const ubicacion of ubicaciones) {
        const ubicacionData = {
          idArticulo: articleId,
          idAlmacen: Number(ubicacion.codigoAlmacen),
          ubicacion: ubicacion.ubicacion,
        };

        await createUbicacionMutation.mutateAsync(ubicacionData);
      }
      return true;
    } catch (error) {
      console.error("Error al guardar ubicaciones:", error);
      return false;
    }
  };

  const handleCreate = async (formData: any): Promise<boolean | ArticleResponse> => {
    setBackendFormError(null);
    try {
      const result = await createArticuloMutation.mutateAsync(formData);
      showCreateSuccess('el artículo');
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al crear artículo';
      setBackendFormError(errorMessage);
      return false;
    }
  };

  const handleUpdate = async (formData: any): Promise<boolean> => {
    if (!currentItem) {
      setBackendFormError("Error: No hay un ítem seleccionado para actualizar.");
      return false;
    }
    setBackendFormError(null);

    try {
      await updateArticuloMutation.mutateAsync({ id: currentItem.id, formData });
      showUpdateSuccess('el artículo');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al actualizar artículo';
      setBackendFormError(errorMessage);
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let success = false;

    try {
      // Handle different tab submissions
      if (activeTab === "ficha") {
        if (!isEditingMode) {
          const result: boolean | ArticleResponse = await handleCreate(data);
          if (result === true || (typeof result === "object" && "id" in result)) {
            if (typeof result === "object" && "id" in result) {
              setCreatedArticleId(result.id);
            }
            success = true;
          }
        } else {
          success = await handleUpdate(data);
        }

        if (success) {
          setShowSuccessModal(true);
        }
      }
      else if (activeTab === "presentaciones") {
        // Handle presentation logic here - save presentations
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (articleId) {
          // Save presentation data here if needed
          success = true;
          showUpdateSuccess('las presentaciones');
        }
      }
      else if (activeTab === "detalles") {
        // Handle details logic here - save details
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (articleId) {
          // Save details data here if needed
          success = true;
          showUpdateSuccess('los detalles');
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
          showUpdateSuccess('los precios');
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
          showUpdateSuccess('las ubicaciones');
        }
      }
      else if (activeTab === "fotos") {
        const articleId = isEditingMode ? currentItem?.id : createdArticleId;
        if (!articleId) {
          console.error("Article ID is missing");
          return;
        }

        success = await saveFotos(articleId);
        if (success) {
          showUpdateSuccess('las fotos');
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
    const fichaFieldNames = ['nombre', 'codigoArticulo', 'codigoModelo', 'codigoBarra', 'descripcion', 'idTipoArticulo', 'idGrupo', 'idImpuesto', 'manejaLote', 'manejaSerial'];
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
          className="px-4 pt-12 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.inventory.headerColor }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
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
        className="px-4 pt-12 pb-6 shadow-sm"
        style={{ backgroundColor: themes.inventory.headerColor }}
      >
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
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

        {/* Improved Tab Navigation */}
        <View className="bg-white/10 rounded-2xl p-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <View className="flex-row space-x-2">
              {/* FICHA */}
              <TouchableOpacity
                onPress={() => setActiveTab("ficha")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "ficha" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "ficha" ? "text-purple-600" : "text-white"
                  }`}
                >
                  FICHA
                </Text>
              </TouchableOpacity>

              {/* PRESENTACIÓN */}
              <TouchableOpacity
                onPress={() => setActiveTab("presentaciones")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "presentaciones" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "presentaciones" ? "text-purple-600" : "text-white"
                  }`}
                >
                  PRESENTACIÓN
                </Text>
              </TouchableOpacity>

              {/* DETALLE */}
              <TouchableOpacity
                onPress={() => setActiveTab("detalles")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "detalles" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "detalles" ? "text-purple-600" : "text-white"
                  }`}
                >
                  DETALLE
                </Text>
              </TouchableOpacity>

              {/* PRECIOS */}
              <TouchableOpacity
                onPress={() => setActiveTab("precios")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "precios" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "precios" ? "text-purple-600" : "text-white"
                  }`}
                >
                  PRECIOS
                </Text>
              </TouchableOpacity>

              {/* UBICACIONES */}
              <TouchableOpacity
                onPress={() => setActiveTab("ubicaciones")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "ubicaciones" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "ubicaciones" ? "text-purple-600" : "text-white"
                  }`}
                >
                  UBICACIONES
                </Text>
              </TouchableOpacity>

              {/* FOTOS */}
              <TouchableOpacity
                onPress={() => setActiveTab("fotos")}
                className={`px-6 py-3 rounded-full ${
                  activeTab === "fotos" ? "bg-white shadow-sm" : "bg-white/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === "fotos" ? "text-purple-600" : "text-white"
                  }`}
                >
                  FOTOS
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
                      name={field.name as keyof Articulo}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                            errors[field.name as keyof Articulo]
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
                          returnKeyType={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "default" : "next"}
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
                    {errors[field.name as keyof Articulo] && (
                      <Text className="text-red-500 text-sm mt-1">
                        {errors[field.name as keyof Articulo]?.message as string}
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
                      name={field.name as keyof Articulo}
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
                                errors[field.name as keyof Articulo]
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
                    {errors[field.name as keyof Articulo] && (
                      <Text className="text-red-500 text-sm mt-1">
                        {errors[field.name as keyof Articulo]?.message as string}
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
                          name={field.name as keyof Articulo}
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
                  <Text className="text-lg font-medium text-gray-800 mb-4">
                    Presentación del Artículo
                  </Text>
                  <Text className="text-sm text-gray-600 mb-4">
                    Selecciona las presentaciones disponibles para este artículo.
                  </Text>
                  
                  {/* Select Fields for Presentaciones */}
                  {selectFields.map((field) => (
                    <View key={field.name} className="mb-4">
                      <View className="flex-row mb-1">
                        <Text className="text-sm font-medium text-gray-700">
                          {field.label}
                        </Text>
                        <Text className="text-gray-400"> (Opcional)</Text>
                      </View>
                      <Controller
                        control={control}
                        name={field.name as keyof Articulo}
                        render={({ field: { onChange, value } }) => {
                          const selectedOptions = Array.isArray(value) ? value : (value ? [value] : []);

                          return (
                            <View>
                              <TouchableOpacity
                                onPress={() => handleSelectPress(field.name)}
                                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border flex-row justify-between items-center ${
                                  errors[field.name as keyof Articulo]
                                    ? "border-red-500"
                                    : "border-gray-200"
                                }`}
                              >
                                <Text className="text-gray-700">
                                  {selectedOptions.length > 0
                                    ? `${selectedOptions.length} presentación(es) seleccionada(s)`
                                    : "Seleccione presentaciones"}
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
                                    {field.options?.map((option) => {
                                      const isSelected = selectedOptions.includes((option as any)[field.optionValue || "id"]);
                                      return (
                                        <TouchableOpacity
                                          key={String((option as any)[field.optionValue || "id"])}
                                          onPress={() => {
                                            const optionValue = (option as any)[field.optionValue || "id"];
                                            let newValue;
                                            if (isSelected) {
                                              newValue = selectedOptions.filter(v => v !== optionValue);
                                            } else {
                                              newValue = [...selectedOptions, optionValue];
                                            }
                                            onChange(newValue);
                                          }}
                                          className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                                            isSelected ? "bg-blue-50" : ""
                                          }`}
                                        >
                                          <Text
                                            className={`${
                                              isSelected
                                                ? "text-blue-600"
                                                : "text-gray-700"
                                            }`}
                                          >
                                            {(option as any)[field.optionLabel || "nombre"]}
                                          </Text>
                                          {isSelected && (
                                            <Ionicons
                                              name="checkmark"
                                              size={16}
                                              color="#2563EB"
                                            />
                                          )}
                                        </TouchableOpacity>
                                      );
                                    })}
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
                      {errors[field.name as keyof Articulo] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof Articulo]?.message as string}
                        </Text>
                      )}
                    </View>
                  ))}

                  {/* Information about principal presentation */}
                  <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <View className="flex-row items-start">
                      <Ionicons name="information-circle" size={20} color="#2563EB" className="mt-0.5" />
                      <View className="ml-2 flex-1">
                        <Text className="text-blue-800 font-medium text-sm">
                          Presentación Principal
                        </Text>
                        <Text className="text-blue-700 text-xs mt-1">
                          La primera presentación seleccionada se marcará automáticamente como principal.
                        </Text>
                      </View>
                    </View>
                  </View>
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
                        name={field.name as keyof Articulo}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                              errors[field.name as keyof Articulo]
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
                            returnKeyType={field.name === 'descripcion' || field.name === 'descripcionGarantia' ? "default" : "next"}
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
                      {errors[field.name as keyof Articulo] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof Articulo]?.message as string}
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
                        name={field.name as keyof Articulo}
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
                                  errors[field.name as keyof Articulo]
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
                      {errors[field.name as keyof Articulo] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors[field.name as keyof Articulo]?.message as string}
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
                            name={field.name as keyof Articulo}
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
                    Listas de Precios
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
                    <View className="flex-row space-x-2">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Fecha Desde
                        </Text>
                        <TextInput
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                          placeholder="YYYY-MM-DD"
                          value={precioInputs.fechaDesde}
                          onChangeText={(text) =>
                            setPrecioInputs((prev: PrecioInputs) => ({
                              ...prev,
                              fechaDesde: text,
                            }))
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Fecha Hasta (Opcional)
                        </Text>
                        <TextInput
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200"
                          placeholder="YYYY-MM-DD"
                          value={precioInputs.fechaHasta}
                          onChangeText={(text) =>
                            setPrecioInputs((prev: PrecioInputs) => ({
                              ...prev,
                              fechaHasta: text,
                            }))
                          }
                        />
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

                  {/* Existing Article Prices */}
                  {isEditingMode && preciosArticuloData && preciosArticuloData.length > 0 && (
                    <View className="mt-6">
                      <Text className="text-base font-semibold text-gray-800 mb-2">Precios del Artículo</Text>
                      <ScrollView className="max-h-48">
                        {preciosArticuloData.map((precio: any) => (
                          <View key={precio.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                            <Text className="font-medium">
                              {precio.nombreListaPrecio || "Lista de Precio"}
                            </Text>
                            <Text className="text-gray-600">
                              {precio.nombreMoneda || "Moneda"}
                            </Text>
                            <Text className="font-bold text-lg">
                              {Number(precio.monto).toFixed(2)}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              {precio.fechaDesde} {precio.fechaHasta ? `- ${precio.fechaHasta}` : ""}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === "ubicaciones" && (
              <>
                {/* Location Section */}
                <View className="mb-6">
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

                  {/* Existing Article Locations */}
                  {isEditingMode && ubicacionesArticuloData && ubicacionesArticuloData.length > 0 && (
                    <View className="mt-6">
                      <Text className="text-base font-semibold text-gray-800 mb-2">Ubicaciones del Artículo</Text>
                      <ScrollView className="max-h-48">
                        {ubicacionesArticuloData.map((ubicacion: any) => (
                          <View key={ubicacion.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                            <Text className="font-medium">
                              {ubicacion.nombreAlmacen || "Almacén"}
                            </Text>
                            <Text className="text-gray-600">
                              {ubicacion.ubicacion || "Sin ubicación específica"}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === "fotos" && (
              <>
                {/* Photos Section with Improved Ordering */}
                <View className="mb-6">
                  <Text className="text-lg font-medium text-gray-800 mb-4">
                    Fotos del Artículo
                  </Text>
                  
                  {selectedImages.length === 0 ? (
                    <>
                      {/* Empty state */}
                      <TouchableOpacity
                        onPress={() => setShowImagePickerModal(true)}
                        className="w-full py-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
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
                      {/* Instructions */}
                      <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <View className="flex-row items-start">
                          <Ionicons name="information-circle" size={20} color="#2563EB" className="mt-0.5" />
                          <View className="ml-2 flex-1">
                            <Text className="text-blue-800 font-medium text-sm">
                              Ordenar Fotos
                            </Text>
                            <Text className="text-blue-700 text-xs mt-1">
                              Toca el número para cambiar el orden. La foto #1 será la principal.
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Grid de imágenes existentes con ordenamiento */}
                      <View className="flex-row flex-wrap">
                        {/* Add photo button */}
                        <View className="w-[32%] mb-4 mr-[2%]">
                          <TouchableOpacity
                            onPress={() => setShowImagePickerModal(true)}
                            className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                          >
                            <Ionicons
                              name="camera-outline"
                              size={24}
                              color="#6B7280"
                            />
                            <Text className="text-gray-500 text-xs mt-1 text-center">
                              Agregar{"\n"}Foto
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {selectedImages.map((image, index) => {
                          const order = imageOrder[image.id] || 0;
                          const isPrincipal = order === 1;
                          
                          return (
                            <View
                              key={image.id || `image-${index}`}
                              className={`w-[32%] mb-4 ${
                                (index + 1) % 3 === 2 ? "mr-[2%]" : ""
                              }`}
                            >
                              <View className="relative">
                                {/* Image */}
                                <Image
                                  source={{ uri: image.uri }}
                                  style={{
                                    width: "100%",
                                    aspectRatio: 1,
                                    borderRadius: 8,
                                  }}
                                  contentFit="cover"
                                />

                                {/* Order Number Badge */}
                                <TouchableOpacity
                                  onPress={() => {
                                    const nextOrder = order === selectedImages.length ? 1 : order + 1;
                                    setImageOrderNumber(image.id, nextOrder);
                                  }}
                                  className={`absolute top-2 left-2 w-8 h-8 rounded-full items-center justify-center shadow-lg z-10 ${
                                    isPrincipal ? "bg-yellow-500" : "bg-blue-500"
                                  }`}
                                >
                                  <Text className="text-white text-xs font-bold">
                                    {order || '#'}
                                  </Text>
                                </TouchableOpacity>

                                {/* Delete button */}
                                <TouchableOpacity
                                  onPress={() => removeImage(index)}
                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-lg z-10"
                                >
                                  <Ionicons
                                    name="close"
                                    size={16}
                                    color="white"
                                  />
                                </TouchableOpacity>

                                {/* Principal indicator */}
                                {isPrincipal && (
                                  <View className="absolute bottom-2 left-2 bg-yellow-500 px-2 py-1 rounded-full">
                                    <Text className="text-white text-xs font-bold">
                                      PRINCIPAL
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons - Changed to Cancel/Save */}
        <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <View className="flex-row space-x-4">
            {/* Cancel Button */}
            <TouchableOpacity
              className="flex-1 bg-gray-100 py-4 rounded-xl flex-row justify-center items-center"
              onPress={() => router.back()}
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
              className={`flex-1 py-4 rounded-xl flex-row justify-center items-center shadow-sm ${
                isSubmitting ? "opacity-70" : ""
              }`}
              onPress={() => {
                if (activeTab === "ficha") {
                  handleSubmit(onSubmit)();
                } else {
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
                {isSubmitting ? "Guardando..." : "Guardar"}
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
                ¡Artículo {isEditingMode ? 'Actualizado' : 'Creado'} Exitosamente!
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
                  router.back();
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
                  setActiveTab("presentaciones");
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
    </View>
  );
};

export default ArticuloForm;