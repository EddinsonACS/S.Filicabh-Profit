import DropdownOverlay from '@/components/common/DropdownOverlay';
import ImageViewer from '@/components/common/ImageViewer';
import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useArticulo } from '@/hooks/Inventario/useArticulo';
import { useArticuloListaDePrecio } from '@/hooks/Inventario/useArticuloListaDePrecio';
import { useArticuloPresentaciones } from '@/hooks/Inventario/useArticuloPresentaciones';
import { useArticuloUbicacion } from '@/hooks/Inventario/useArticuloUbicacion';
import { usePresentacion } from '@/hooks/Inventario/usePresentacion';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ArticuloDetalle: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("ficha");
  const [viewMode, setViewMode] = useState<'chips' | 'dropdown'>('chips');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownButtonRef = useRef<any>(null);
  const photoScrollRef = useRef<ScrollView>(null);
  
  const { 
    showDeleteSuccess,
    showError 
  } = useNotificationContext();
  
  const {
    useGetArticuloItem,
    useDeleteArticulo
  } = useArticulo();

  const {
    useGetArticuloListaDePrecioList,
  } = useArticuloListaDePrecio();

  const {
    useGetArticuloUbicacionList,
  } = useArticuloUbicacion();

  const {
    useGetArticuloPresentacionesList,
  } = useArticuloPresentaciones();

  const {
    useGetPresentacionList,
  } = usePresentacion();

  const { data: articulo, isLoading, refetch } = useGetArticuloItem(Number(id));
  const deleteArticuloMutation = useDeleteArticulo();
  const { data: articuloListaDePrecio } = useGetArticuloListaDePrecioList(1, 100);
  const { data: articuloUbicacion } = useGetArticuloUbicacionList(1, 100);
  const { data: articuloPresentaciones } = useGetArticuloPresentacionesList(1, 100);
  const { data: presentacionesData } = useGetPresentacionList(1, 100);

  // Refrescar automáticamente al volver a la pantalla (por ejemplo, después de editar)
  useFocusEffect(
    useCallback(() => {
      console.log('📱 ArticuloDetalle enfocado, refrescando datos...');
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
      showError('Error', 'No se pudo actualizar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = () => {
    console.log('handleEdit');
    console.log(id);
    router.push(`/(views)/(Entidades)/ArticuloForm?id=${id}&isEditing=true`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el artículo "${articulo?.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (articulo?.id) {
              deleteArticuloMutation.mutate(articulo.id, {
                onSuccess: () => {
                  showDeleteSuccess('el artículo');
                  router.push('/(views)/(Entidades)/EntInventario?category=articulo');
                },
                onError: (error: any) => {
                  const errorMessage = error.response?.data?.mensaje || error.message || 'Error al eliminar el artículo';
                  showError('Error', errorMessage);
                }
              });
            }
          },
        },
      ]
    );
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
    }
  };

  const handleImageModalClose = () => {
    setShowImageViewer(false);
  };

  // Función para obtener campos de ficha básica
  const getFichaFields = () => {
    if (!articulo) return [];
    try {
      // Función helper para formatear fechas de forma segura
      const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'Fecha inválida';
          return date.toLocaleDateString('es-ES');
        } catch (error) {
          return 'Error en fecha';
        }
      };

      return [
        { label: 'Nombre', value: articulo?.nombre || 'N/A' },
        { label: 'Código Artículo', value: articulo?.codigoArticulo || 'N/A' },
        { label: 'Código de Barra', value: articulo?.codigoBarra || 'N/A' },
        { label: 'Código Modelo', value: articulo?.codigoModelo || 'N/A' },
        { label: 'Descripción', value: articulo?.descripcion || 'N/A' },
        { label: 'Tipo de Artículo', value: articulo?.tipoArticuloNombre || 'N/A' },
        { label: 'Grupo', value: articulo?.grupoNombre || 'N/A' },
        { label: 'Tipo de Impuesto', value: articulo?.tipoDeImpuestoNombre || 'N/A' },
        { label: 'Maneja Lote', value: articulo?.manejaLote ? 'Sí' : 'No' },
        { label: 'Maneja Serial', value: articulo?.manejaSerial ? 'Sí' : 'No' },
        { label: 'Suspendido', value: articulo?.suspendido ? 'Sí' : 'No' },
        // Información del sistema
        { label: 'ID', value: String(articulo?.id || 'N/A') },
        { label: 'Fecha de Registro', value: formatDate(articulo?.fechaRegistro) },
        { label: 'Usuario Registro', value: articulo?.usuarioRegistroNombre || 'N/A' },
        { label: 'Fecha de Modificación', value: formatDate(articulo?.fechaModificacion) },
        { label: 'Usuario Modificación', value: articulo?.usuarioModificacionNombre || 'N/A' },
      ];
    } catch (error) {
      console.error('Error getting ficha fields:', error);
      return [];
    }
  };

  // Función para obtener campos de presentación
  const getPresentacionFields = () => {
    // Verificar si tenemos el artículo
    if (!articulo) {
      return [{ label: 'Cargando información del artículo...', value: '' }];
    }

    // Verificar si están cargando los datos de presentaciones
    if (!articuloPresentaciones || !presentacionesData) {
      return [{ label: 'Cargando presentaciones...', value: '' }];
    }
    
    try {
      console.log('🎯 Datos de presentaciones del artículo:', articuloPresentaciones);
      console.log('🎯 Datos maestros de presentaciones:', presentacionesData);
      
      // Filtrar presentaciones que pertenecen a este artículo
      const presentacionesDelArticulo = articuloPresentaciones.data?.filter(
        (articuloPres: any) => articuloPres.idArticulo === articulo.id
      ) || [];

      console.log('🎯 Presentaciones filtradas del artículo:', presentacionesDelArticulo);

      if (presentacionesDelArticulo.length === 0) {
        return [{ label: 'Sin presentaciones', value: 'Este artículo no tiene presentaciones configuradas' }];
      }

      // Crear un resumen general
      const resumenFields = [
        { 
          label: 'Total de presentaciones', 
          value: `${presentacionesDelArticulo.length} configurada(s)` 
        }
      ];

      // Mapear cada presentación con su información detallada
      const presentacionesDetalle = presentacionesDelArticulo.map((articuloPres: any, index: number) => {
        // Buscar el nombre de la presentación en los datos maestros
        const presentacionInfo = presentacionesData.data?.find(
          (pres: any) => pres.id === articuloPres.idPresentacion
        );

        const presentacionNombre = presentacionInfo?.nombre || `Presentación ID: ${articuloPres.idPresentacion}`;
        
        const caracteristicas = [];
        if (articuloPres.esPrincipal) caracteristicas.push('Principal');
        if (articuloPres.equivalencia && articuloPres.equivalencia !== 1) {
          caracteristicas.push(`Equiv: ${articuloPres.equivalencia}`);
        }
        if (articuloPres.usarEnVentas) caracteristicas.push('Ventas');
        if (articuloPres.usarEnCompras) caracteristicas.push('Compras');

        const detalles = caracteristicas.length > 0 
          ? `${presentacionNombre} (${caracteristicas.join(', ')})`
          : presentacionNombre;

        return {
          label: `${index + 1}. ${presentacionNombre}`,
          value: caracteristicas.length > 0 ? caracteristicas.join(' • ') : 'Configuración estándar'
        };
      });

      return [...resumenFields, ...presentacionesDetalle];
    } catch (error) {
      console.error('Error getting presentacion fields:', error);
      return [{ label: 'Error al cargar presentaciones', value: 'Verifique la consola para más detalles' }];
    }
  };

  // Función para obtener campos de detalles
  const getDetalleFields = () => {
    if (!articulo) return [];
    try {
      return [
        { label: 'Color', value: articulo?.colorNombre || 'N/A' },
        { label: 'Talla', value: articulo?.tallaNombre || 'N/A' },
        { label: 'Peso', value: `${articulo?.peso || 0} kg` },
        { label: 'Volumen', value: `${articulo?.volumen || 0} m³` },
        { label: 'Metro Cúbico', value: `${articulo?.metroCubico || 0}` },
        { label: 'Pie', value: `${articulo?.pie || 0}` },
        { label: 'Maneja Punto Mínimo', value: articulo?.manejaPuntoMinimo ? 'Sí' : 'No' },
        { label: 'Punto Mínimo', value: String(articulo?.puntoMinimo || 0) },
        { label: 'Maneja Punto Máximo', value: articulo?.manejaPuntoMaximo ? 'Sí' : 'No' },
        { label: 'Punto Máximo', value: String(articulo?.puntoMaximo || 0) },
        { label: 'Posee Garantía', value: articulo?.poseeGarantia ? 'Sí' : 'No' },
        { label: 'Descripción Garantía', value: articulo?.descripcionGarantia || 'N/A' },
      ];
    } catch (error) {
      console.error('Error getting detalle fields:', error);
      return [];
    }
  };

  // Función para obtener campos de precios (lista filtrada por idArticulo)
  const getPreciosFields = () => {
    if (!articulo || !articuloListaDePrecio || !Array.isArray(articuloListaDePrecio.data)) return [];
    try {
      const preciosFiltrados = articuloListaDePrecio.data.filter((item: any) => item.idArticulo === articulo.id);
      if (preciosFiltrados.length === 0) {
        return [{ label: 'No hay listas para este articulo', value: '' }];
      }
      // Muestra cada precio como un item de la lista
      return preciosFiltrados.map((item: any, idx: number) => ({
        label: `Precio #${idx + 1}`,
        value: `${item.monto} ${item.monedaNombre || ''}`.trim()
      }));
    } catch (error) {
      console.error('Error getting precios fields:', error);
      return [];
    }
  };

  // Función para obtener campos de ubicaciones (lista filtrada por idArticulo)
  const getUbicacionesFields = () => {
    if (!articulo || !articuloUbicacion || !Array.isArray(articuloUbicacion.data)) return [];
    try {
      const ubicacionesFiltradas = articuloUbicacion.data.filter((item: any) => item.idArticulo === articulo.id);
      if (ubicacionesFiltradas.length === 0) {
        return [{ label: 'No hay listas para este articulo', value: '' }];
      }
      // Muestra cada ubicación como un item de la lista
      return ubicacionesFiltradas.map((item: any, idx: number) => ({
        label: `Ubicación #${idx + 1}`,
        value: `${item.almacenNombre || ''} (${item.ubicacion || ''})`.trim()
      }));
    } catch (error) {
      console.error('Error getting ubicaciones fields:', error);
      return [];
    }
  };



  // Función helper para validar y sanear campos
  const validateAndSanitizeFields = (fields: any[]): Array<{label: string, value: string}> => {
    if (!Array.isArray(fields)) {
      console.warn('Fields is not an array:', fields);
      return [];
    }
    
    return fields
      .filter((field) => {
        // Verificar que el campo tenga la estructura básica
        return field && 
               typeof field === 'object' && 
               (field.label !== undefined && field.label !== null) &&
               (field.value !== undefined && field.value !== null);
      })
      .map((field) => ({
        label: String(field.label || 'Campo desconocido'),
        value: String(field.value || 'N/A')
      }));
  };

  // Función para obtener los campos según la pestaña activa
  const getActiveTabFields = () => {
    try {
      let rawFields = [];
      
      switch (activeDetailTab) {
        case 'ficha':
          rawFields = getFichaFields();
          break;
        case 'presentaciones':
          rawFields = getPresentacionFields();
          break;
        case 'detalles':
          rawFields = getDetalleFields();
          break;
        case 'precios':
          rawFields = getPreciosFields();
          break;
        case 'ubicaciones':
          rawFields = getUbicacionesFields();
          break;
        default:
          rawFields = getFichaFields();
          break;
      }
      
      return validateAndSanitizeFields(rawFields);
    } catch (error) {
      console.error('Error getting active tab fields:', error);
      return [{ label: 'Error', value: 'No se pudo cargar la información' }];
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }} className="bg-gray-50">
        <View 
          className="px-4 pt-4 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.inventory.headerColor }}
        >
          <TouchableOpacity
            onPress={() => {
              router.replace('/(views)/(Entidades)/EntInventario?category=articulo');
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
            className="text-lg font-bold flex-1"
            style={{ color: themes.inventory.headerTextColor }}
          >
            Cargando...
          </Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-8 mx-4 items-center shadow-sm">
            <Ionicons name="refresh" size={48} color={themes.inventory.buttonColor} />
            <Text className="text-gray-600 text-lg font-medium mt-4">Cargando artículo</Text>
            <Text className="text-gray-500 text-center mt-2">Obteniendo información...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!articulo) {
    return (
      <View style={{ flex: 1 }} className="bg-gray-50">
        <View 
          className="px-4 pt-4 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.inventory.headerColor }}
        >
          <TouchableOpacity
            onPress={() => {
              router.replace('/(views)/(Entidades)/EntInventario?category=articulo');
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
            className="text-lg font-bold flex-1"
            style={{ color: themes.inventory.headerTextColor }}
          >
            Error
          </Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-8 mx-4 items-center shadow-sm">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-gray-800 text-lg font-medium mt-4">Artículo no encontrado</Text>
            <Text className="text-gray-500 text-center mt-2">No se pudo cargar la información del artículo</Text>
          </View>
        </View>
      </View>
    );
  }

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <View style={{ flex: 1 }} className="bg-gray-50">
      {/* Header optimized */}
      <View 
        className="px-4 pt-4 pb-4 flex-row items-center justify-between shadow-sm"
        style={{ backgroundColor: themes.inventory.headerColor }}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity
            onPress={() => {
              router.replace('/(views)/(Entidades)/EntInventario?category=articulo');
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
            className="text-lg font-bold flex-1"
            style={{ color: themes.inventory.headerTextColor }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {articulo.nombre}
          </Text>
        </View>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={handleEdit}
            className="p-3 rounded-full bg-white/10"
          >
            <Ionicons 
              name="pencil" 
              size={20} 
              color={themes.inventory.headerTextColor} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            className="p-3 rounded-full bg-red-500/90"
          >
            <Ionicons 
              name="trash" 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 -mt-2"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themes.inventory.buttonColor}
          />
        }
      >
        {/* Hero Section with Carousel */}
        <View className="bg-white">
          <View className="relative">
            {articulo.fotos && articulo.fotos.length > 0 ? (
              <ScrollView
                ref={photoScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                  setCurrentPhotoIndex(newIndex);
                }}
                style={{ height: 256 }}
              >
                {articulo.fotos.map((foto, index) => (
                  <TouchableOpacity
                    key={foto.id || index}
                    onPress={() => {
                      setCurrentPhotoIndex(index);
                      setShowImageViewer(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{
                        uri: `https://wise.filicabh.com.ve:5000/${foto.urlFoto}`,
                      }}
                      className="w-full h-64"
                      style={{ width: require('react-native').Dimensions.get('window').width }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="w-full h-64 bg-gray-100 items-center justify-center">
                <Ionicons name="cube-outline" size={64} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Sin imagen</Text>
              </View>
            )}
            
            {/* Photo Counter */}
            {articulo.fotos && articulo.fotos.length > 0 && (
              <View className="absolute top-4 left-4">
                <View className="px-3 py-1 rounded-full shadow-sm bg-black/70">
                  <Text className="text-white text-sm font-medium">
                    {currentPhotoIndex + 1}/{articulo.fotos.length}
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation Arrows for multiple photos */}
            {articulo.fotos && articulo.fotos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <TouchableOpacity
                    className="absolute left-4 top-1/2 -translate-y-6"
                    onPress={() => {
                      const newIndex = currentPhotoIndex - 1;
                      setCurrentPhotoIndex(newIndex);
                      const screenWidth = require('react-native').Dimensions.get('window').width;
                      photoScrollRef.current?.scrollTo({
                        x: newIndex * screenWidth,
                        animated: true
                      });
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                )}
                
                {currentPhotoIndex < articulo.fotos.length - 1 && (
                  <TouchableOpacity
                    className="absolute right-4 top-1/2 -translate-y-6"
                    onPress={() => {
                      const newIndex = currentPhotoIndex + 1;
                      setCurrentPhotoIndex(newIndex);
                      const screenWidth = require('react-native').Dimensions.get('window').width;
                      photoScrollRef.current?.scrollTo({
                        x: newIndex * screenWidth,
                        animated: true
                      });
                    }}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {/* Status Badge Overlay - Solo mostrar cuando esté inactivo */}
            {articulo.suspendido && (
              <View className="absolute top-4 right-4">
                <View className="px-3 py-1 rounded-full shadow-sm bg-red-500">
                  <Text className="text-white text-sm font-medium">
                    Inactivo
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Main Info */}
          <View className="p-4 ml-4">
            <Text className="text-xl font-bold text-gray-900">
              {articulo.nombre}
            </Text>
          </View>
        </View>


        {/* Detailed Information with Tabs */}
        {articulo && !isLoading && (
          <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
            {/* Tab Header - Optimized and Compact */}
            <View 
              className="px-4 py-3"
              style={{ backgroundColor: themes.inventory.headerColor }}
            >
              {/* Tab Navigation - Chips or Dropdown Style */}
              {viewMode === 'chips' ? (
                <View className="flex-row items-center justify-between">
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 4 }}
                    style={{ flex: 1 }}
                  >
                    {[
                      { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                      { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                      { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                      { id: "precios", name: "Precio", icon: "pricetag-outline" },
                      { id: "ubicaciones", name: "Ubicacion", icon: "location-outline" }
                    ].map((tab, index) => (
                      <TouchableOpacity
                        key={tab.id}
                        style={{
                          marginRight: index < 4 ? 8 : 0,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: activeDetailTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          borderWidth: 1,
                          borderColor: activeDetailTab === tab.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        }}
                        onPress={() => setActiveDetailTab(tab.id)}
                      >
                        <Ionicons
                          name={tab.icon as any}
                          size={14}
                          color={activeDetailTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)'}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            color: activeDetailTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                            fontWeight: activeDetailTab === tab.id ? '600' : 'normal',
                            fontSize: 12
                          }}
                        >
                          {tab.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    className="bg-white rounded-xl p-1.5 flex-row items-center ml-2"
                    onPress={() => setViewMode('dropdown')}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2
                    }}
                  >
                    <Ionicons
                      name="list-outline"
                      size={16}
                      color={themes.inventory.headerColor}
                    />
                    <Text style={{ color: themes.inventory.headerColor }} className="ml-1 text-xs">
                      Lista
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="relative">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.2)',
                        padding: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flex: 1,
                        marginRight: 8
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
                            { id: "precios", name: "Precios", icon: "pricetag-outline" },
                            { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" }
                          ].find(tab => tab.id === activeDetailTab)?.icon as any || 'grid-outline'}
                          size={16}
                          color="white"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                          {[
                            { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                            { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                            { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                            { id: "precios", name: "Precios", icon: "pricetag-outline" },
                            { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" }
                          ].find(tab => tab.id === activeDetailTab)?.name || 'Seleccionar sección'}
                        </Text>
                      </View>
                      <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-white rounded-xl p-1.5 flex-row items-center"
                      onPress={() => setViewMode('chips')}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2
                      }}
                    >
                      <Ionicons
                        name="grid-outline"
                        size={16}
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
            
            {/* Tab Content */}
            <View className="p-6">
              <View className="space-y-4">
                {(() => {
                  const fields = getActiveTabFields();
                  
                  if (!fields || fields.length === 0) {
                    return (
                      <View className="py-8 items-center">
                        <Ionicons name="information-circle-outline" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 text-center mt-2">
                          No hay información disponible para esta sección
                        </Text>
                      </View>
                    );
                  }
                  
                  return fields.map((field, index) => (
                    <View key={`field-${activeDetailTab}-${index}`} className="flex-row justify-between items-start">
                      <Text className="text-sm text-gray-600 flex-1 mr-4 leading-relaxed">
                        {field.label}
                      </Text>
                      <Text className="text-sm text-gray-900 font-medium text-right flex-1 leading-relaxed">
                        {field.value}
                      </Text>
                    </View>
                  ));
                })()}
              </View>
            </View>
          </View>
        )}
        
        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* Dropdown Overlay */}
      <DropdownOverlay
        isVisible={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        options={[
          { id: "ficha", name: "Ficha", icon: "document-text-outline" },
          { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
          { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
          { id: "precios", name: "Precios", icon: "pricetag-outline" },
          { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" }
        ]}
        activeOption={activeDetailTab}
        onSelectOption={setActiveDetailTab}
        position={dropdownPosition}
        theme={themes.inventory}
      />


      {/* Image Viewer Component */}
      <ImageViewer
        visible={showImageViewer}
        images={articulo?.fotos || []}
        initialIndex={currentPhotoIndex}
        onClose={handleImageModalClose}
      />
    </View>
  );
};

export default ArticuloDetalle;