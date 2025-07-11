import { useArticulo } from '@/hooks/Inventario/useArticulo';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { themes } from '@/components/Entidades/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ArticuloDetalle: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  
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
                  router.back();
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

  const getSystemFields = () => {
    if (!articulo) return [];

    return [
      { label: 'ID', value: String(articulo.id) },
      { label: 'Código Artículo', value: articulo.codigoArticulo || 'N/A' },
      { label: 'Código de Barra', value: articulo.codigoBarra || 'N/A' },
      { label: 'Código Modelo', value: articulo.codigoModelo || 'N/A' },
      { label: 'Grupo', value: articulo.grupoNombre || 'N/A' },
      { label: 'Color', value: articulo.colorNombre || 'N/A' },
      { label: 'Talla', value: articulo.tallaNombre || 'N/A' },
      { label: 'Tipo de Artículo', value: articulo.tipoArticuloNombre || 'N/A' },
      { label: 'Tipo de Impuesto', value: articulo.tipoDeImpuestoNombre || 'N/A' },
      { label: 'Precio', value: `$${articulo.precio || 0}` },
      { label: 'Stock Actual', value: String(articulo.stockActual || 0) },
      { label: 'Peso', value: `${articulo.peso || 0} kg` },
      { label: 'Volumen', value: `${articulo.volumen || 0} m³` },
      { label: 'Metro Cúbico', value: `${articulo.metroCubico || 0}` },
      { label: 'Pie', value: `${articulo.pie || 0}` },
      { label: 'Punto Mínimo', value: String(articulo.puntoMinimo || 0) },
      { label: 'Punto Máximo', value: String(articulo.puntoMaximo || 0) },
      { label: 'Descripción', value: articulo.descripcion || 'N/A' },
      { label: 'Descripción Garantía', value: articulo.descripcionGarantia || 'N/A' },
      { label: 'Maneja Lote', value: articulo.manejaLote ? 'Sí' : 'No' },
      { label: 'Maneja Serial', value: articulo.manejaSerial ? 'Sí' : 'No' },
      { label: 'Posee Garantía', value: articulo.poseeGarantia ? 'Sí' : 'No' },
      { label: 'Maneja Punto Mínimo', value: articulo.manejaPuntoMinimo ? 'Sí' : 'No' },
      { label: 'Maneja Punto Máximo', value: articulo.manejaPuntoMaximo ? 'Sí' : 'No' },
      { label: 'Fecha de Registro', value: articulo.fechaRegistro ? new Date(articulo.fechaRegistro).toLocaleDateString() : 'N/A' },
      { label: 'Usuario Registro', value: articulo.usuarioRegistroNombre || 'N/A' },
      { label: 'Fecha de Modificación', value: articulo.fechaModificacion ? new Date(articulo.fechaModificacion).toLocaleDateString() : 'N/A' },
      { label: 'Usuario Modificación', value: articulo.usuarioModificacionNombre || 'N/A' },
    ];
  };

  if (isLoading) {
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
            
            {/* Status Badge Overlay */}
            <View className="absolute top-4 right-4">
              <View
                className={`px-3 py-1 rounded-full shadow-sm ${
                  articulo.suspendido
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              >
                <Text className="text-white text-sm font-medium">
                  {articulo.suspendido ? "Inactivo" : "Activo"}
                </Text>
              </View>
            </View>
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
            
            {/* Price and Stock Cards */}
            <View className="flex-row space-x-4 mb-6">
              <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200">
                <Text className="text-green-600 text-sm font-medium mb-1">Precio</Text>
                <Text className="text-2xl font-bold text-green-700">
                  ${articulo.precio || 0}
                </Text>
              </View>
              
              <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <Text className="text-blue-600 text-sm font-medium mb-1">Stock Actual</Text>
                <Text className="text-2xl font-bold text-blue-700">
                  {articulo.stockActual || 0}
                </Text>
              </View>
            </View>
            
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

        {/* Detailed Information */}
        <View className="bg-white mx-4 rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Información Completa
          </Text>
          
          <View className="space-y-4">
            {getSystemFields().map((field, index) => (
              <View key={index} className="flex-row justify-between items-start">
                <Text className="text-sm text-gray-600 flex-1 mr-4 leading-relaxed">
                  {field.label}
                </Text>
                <Text className="text-sm text-gray-900 font-medium text-right flex-1 leading-relaxed">
                  {field.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default ArticuloDetalle;