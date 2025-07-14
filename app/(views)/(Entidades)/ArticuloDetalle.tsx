import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useArticulo } from '@/hooks/Inventario/useArticulo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ArticuloDetalle: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("ficha");
  
  const { 
    showDeleteSuccess,
    showError 
  } = useNotificationContext();
  
  const {
    useGetArticuloItem,
    useDeleteArticulo
  } = useArticulo();
  
  const { data: articulo, isLoading, refetch } = useGetArticuloItem(Number(id));
  const deleteArticuloMutation = useDeleteArticulo();

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
    if (!articulo) return [];
    try {
      let presentacionesValue = 'N/A';
      
      if (articulo?.presentaciones) {
        if (Array.isArray(articulo.presentaciones)) {
          if (articulo.presentaciones.length > 0) {
            presentacionesValue = articulo.presentaciones.filter(p => p != null).join(', ') || 'N/A';
          }
        } else if (typeof articulo.presentaciones === 'string' || typeof articulo.presentaciones === 'number') {
          presentacionesValue = String(articulo.presentaciones);
        }
      }
      
      return [
        { label: 'Presentaciones', value: presentacionesValue },
      ];
    } catch (error) {
      console.error('Error getting presentacion fields:', error);
      return [{ label: 'Presentaciones', value: 'Error al cargar' }];
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

  // Función para obtener campos de precios
  const getPreciosFields = () => {
    if (!articulo) return [];
    try {
      return [
        { label: 'Precio', value: `$${articulo?.precio || 0}` },
        { label: 'Stock Actual', value: String(articulo?.stockActual || 0) },
      ];
    } catch (error) {
      console.error('Error getting precios fields:', error);
      return [];
    }
  };

  // Función para obtener campos de ubicaciones (vacío por ahora, se puede expandir)
  const getUbicacionesFields = () => {
    if (!articulo) return [];
    try {
      return [
        { label: 'Ubicaciones', value: 'Consultar sección de ubicaciones específicas' },
      ];
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
          className="px-4 pt-12 pb-4 flex-row items-center"
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
          className="px-4 pt-12 pb-4 flex-row items-center"
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

  return (
    <View style={{ flex: 1 }} className="bg-gray-50">
      {/* Header optimized */}
      <View 
        className="px-4 pt-12 pb-4 flex-row items-center justify-between shadow-sm"
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
        {/* Hero Section with Image */}
        <View className="bg-white">
          <View className="relative">
            {articulo.fotos && articulo.fotos.length > 0 ? (
              <Image
                source={{
                  uri: `https://wise.filicabh.com.ve:5000/${articulo.fotos[0].urlFoto}`,
                }}
                className="w-full h-64"
                resizeMode="cover"
              />
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
                    1/{articulo.fotos.length}
                  </Text>
                </View>
              </View>
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
          <View className="p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {articulo.nombre}
            </Text>
            
            {articulo.descripcion && (
              <Text className="text-gray-600 mb-4 leading-relaxed">
                {articulo.descripcion}
              </Text>
            )}
            
          </View>
        </View>

        {/* Photos Gallery */}
        {articulo.fotos && articulo.fotos.length > 1 && (
          <View className="bg-white mx-4 rounded-xl p-6 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Galería de Fotos ({articulo.fotos.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-4">
                {articulo.fotos.map((foto, index) => (
                  <View key={foto.id || index} className="relative">
                    <Image
                      source={{
                        uri: `https://wise.filicabh.com.ve:5000/${foto.urlFoto}`,
                      }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />
                    {foto.esPrincipal && (
                      <View className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full items-center justify-center shadow-sm">
                        <Ionicons name="star" size={14} color="white" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Detailed Information with Tabs */}
        {articulo && !isLoading && (
          <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
            {/* Tab Header */}
            <View 
              className="px-6 py-4"
              style={{ backgroundColor: themes.inventory.headerColor }}
            >
              <Text 
                className="text-lg font-semibold mb-3"
                style={{ color: themes.inventory.headerTextColor }}
              >
                Información Completa
              </Text>
              
              {/* Tab Navigation */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 2 }}
              >
                {[
                  { id: "ficha", name: "Ficha", icon: "document-text-outline" },
                  { id: "presentaciones", name: "Presentación", icon: "layers-outline" },
                  { id: "detalles", name: "Detalle", icon: "information-circle-outline" },
                  { id: "precios", name: "Precios", icon: "pricetag-outline" },
                  { id: "ubicaciones", name: "Ubicaciones", icon: "location-outline" }
                ].map((tab, index) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={{
                      marginRight: index < 4 ? 12 : 0,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
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
                      size={16}
                      color={activeDetailTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: activeDetailTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                        fontWeight: activeDetailTab === tab.id ? '600' : 'normal',
                        fontSize: 14
                      }}
                    >
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    </View>
  );
};

export default ArticuloDetalle;