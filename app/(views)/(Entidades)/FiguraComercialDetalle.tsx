import DropdownOverlay from '@/components/common/DropdownOverlay';
import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useFiguraComercial } from '@/hooks/Ventas/useFiguraComercial';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const FiguraComercialDetalle: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("ficha");
  const [viewMode, setViewMode] = useState<'chips' | 'dropdown'>('chips');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownButtonRef = useRef<any>(null);
  
  const { 
    showDeleteSuccess,
    showError 
  } = useNotificationContext();
  
  const {
    useGetFiguraComercialItem,
    useDeleteFiguraComercial
  } = useFiguraComercial();

  const { data: figuraComercial, isLoading, refetch } = useGetFiguraComercialItem(Number(id));
  const deleteFiguraMutation = useDeleteFiguraComercial();

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
    router.push(`/(views)/(Entidades)/FiguraComercialForm?id=${id}&isEditing=true`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar la figura comercial "${figuraComercial?.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (figuraComercial?.id) {
              deleteFiguraMutation.mutate(figuraComercial.id, {
                onSuccess: () => {
                  showDeleteSuccess('la figura comercial');
                  router.push('/(views)/(Entidades)/EntVentas?category=figuracomercial');
                },
                onError: (error: any) => {
                  const errorMessage = error.response?.data?.mensaje || error.message || 'Error al eliminar la figura comercial';
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

  // Función para obtener campos de ficha básica
  const getFichaFields = () => {
    if (!figuraComercial) return [];
    try {
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
        { label: 'Nombre', value: figuraComercial?.nombre || 'N/A' },
        { label: 'RIF', value: figuraComercial?.rif || 'N/A' },
        { label: 'NIT', value: figuraComercial?.nit || 'N/A' },
        { label: 'Tipo de Persona', value: figuraComercial?.tipoPersonaNombre || 'N/A' },
        { label: 'Teléfono', value: figuraComercial?.telefono || 'N/A' },
        { label: 'Email', value: figuraComercial?.email || 'N/A' },
        { label: 'Email Alterno', value: figuraComercial?.emailAlterno || 'N/A' },
        { label: 'Persona de Contacto', value: figuraComercial?.personaContacto || 'N/A' },
        { label: 'Es Sucursal', value: figuraComercial?.esSucursal ? 'Sí' : 'No' },
        { label: 'Dirección Comercial', value: figuraComercial?.direccionComercial || 'N/A' },
        { label: 'Dirección de Entrega', value: figuraComercial?.direccionEntrega || 'N/A' },
        { label: 'Descripción', value: figuraComercial?.descripcionFiguraComercial || 'N/A' },
        { label: 'País', value: figuraComercial?.paisNombre || 'N/A' },
        { label: 'Ciudad', value: figuraComercial?.ciudadNombre || 'N/A' },
        { label: 'Rubro', value: figuraComercial?.rubroNombre || 'N/A' },
        { label: 'Sector', value: figuraComercial?.sectorNombre || 'N/A' },
        { label: 'Vendedor', value: figuraComercial?.vendedorNombre || 'N/A' },
        { label: 'Suspendido', value: figuraComercial?.suspendido ? 'Sí' : 'No' },
        // Información del sistema
        { label: 'ID', value: String(figuraComercial?.id || 'N/A') },
        { label: 'Fecha de Registro', value: formatDate(figuraComercial?.fechaRegistro) },
        { label: 'Usuario Registro', value: figuraComercial?.usuarioRegistroNombre || 'N/A' },
        { label: 'Fecha de Modificación', value: formatDate(figuraComercial?.fechaModificacion) },
        { label: 'Usuario Modificación', value: figuraComercial?.usuarioModificacionNombre || 'N/A' },
      ];
    } catch (error) {
      console.error('Error getting ficha fields:', error);
      return [];
    }
  };

  // Función para obtener campos de información financiera
  const getFinancieraFields = () => {
    if (!figuraComercial) return [];
    try {
      const fields = [
        { label: 'Acuerdo de Pago', value: figuraComercial?.acuerdoDePagoNombre || 'N/A' },
        { label: 'Activo para Ventas', value: figuraComercial?.activoVentas ? 'Sí' : 'No' },
        { label: 'Activo para Compras', value: figuraComercial?.activoCompras ? 'Sí' : 'No' },
      ];

      // Agregar información de límites de crédito si existen
      if (figuraComercial.montolimiteCreditoVentas && figuraComercial.montolimiteCreditoVentas > 0) {
        fields.push(
          { label: 'Maneja Límite de Crédito', value: 'Sí' },
          { label: 'Monto Límite de Crédito', value: `${figuraComercial.montolimiteCreditoVentas}` },
          { label: 'ID Moneda Crédito', value: String(figuraComercial.idMonedaLimiteCreditoVentas || 'N/A') }
        );
      } else {
        fields.push({ label: 'Maneja Límite de Crédito', value: 'No' });
      }

      // Agregar información de límites de débito si existen
      if (figuraComercial.montolimiteCreditoCompras && figuraComercial.montolimiteCreditoCompras > 0) {
        fields.push(
          { label: 'Maneja Límite de Débito', value: 'Sí' },
          { label: 'Monto Límite de Débito', value: `${figuraComercial.montolimiteCreditoCompras}` },
          { label: 'ID Moneda Débito', value: String(figuraComercial.idMonedaLimiteCreditoCompras || 'N/A') }
        );
      } else {
        fields.push({ label: 'Maneja Límite de Débito', value: 'No' });
      }

      // Información de retenciones
      fields.push(
        { label: 'Aplica Ret. Ventas Auto.', value: figuraComercial?.aplicaRetVentasAuto ? 'Sí' : 'No' },
        { label: 'Aplica Ret. Compras Auto.', value: figuraComercial?.aplicaRetComprasAuto ? 'Sí' : 'No' },
        { label: 'Porcentaje Retención IVA', value: `${figuraComercial?.porceRetencionIvaCompra || 0}%` }
      );

      return fields;
    } catch (error) {
      console.error('Error getting financiera fields:', error);
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
        case 'financiera':
          rawFields = getFinancieraFields();
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
          style={{ backgroundColor: themes.sales.headerColor }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push('/(views)/(Entidades)/EntVentas?category=figuracomercial');
            }}
            className="mr-3 p-2 rounded-full bg-white/10"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={themes.sales.headerTextColor} 
            />
          </TouchableOpacity>
          <Text 
            className="text-lg font-bold flex-1"
            style={{ color: themes.sales.headerTextColor }}
          >
            Cargando...
          </Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-8 mx-4 items-center shadow-sm">
            <Ionicons name="refresh" size={48} color={themes.sales.buttonColor} />
            <Text className="text-gray-600 text-lg font-medium mt-4">Cargando figura comercial</Text>
            <Text className="text-gray-500 text-center mt-2">Obteniendo información...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!figuraComercial) {
    return (
      <View style={{ flex: 1 }} className="bg-gray-50">
        <View 
          className="px-4 pt-4 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.sales.headerColor }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push('/(views)/(Entidades)/EntVentas?category=figuracomercial');
            }}
            className="mr-3 p-2 rounded-full bg-white/10"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={themes.sales.headerTextColor} 
            />
          </TouchableOpacity>
          <Text 
            className="text-lg font-bold flex-1"
            style={{ color: themes.sales.headerTextColor }}
          >
            Error
          </Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-8 mx-4 items-center shadow-sm">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-gray-800 text-lg font-medium mt-4">Figura comercial no encontrada</Text>
            <Text className="text-gray-500 text-center mt-2">No se pudo cargar la información</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} className="bg-gray-50">
      {/* Header optimized */}
      <View 
        className="px-4 pt-6 pb-4 flex-row items-center justify-between shadow-sm"
        style={{ backgroundColor: themes.sales.headerColor, minHeight: 80, zIndex: 1000 }}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity
            onPress={() => {
              router.push('/(views)/(Entidades)/EntVentas?category=figuracomercial');
            }}
            className="mr-3 p-2 rounded-full bg-white/10"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={themes.sales.headerTextColor} 
            />
          </TouchableOpacity>
          <Text 
            className="text-lg font-bold flex-1"
            style={{ color: themes.sales.headerTextColor }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {figuraComercial.nombre}
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
              color={themes.sales.headerTextColor} 
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
            tintColor={themes.sales.buttonColor}
          />
        }
      >
        {/* Hero Section */}
        <View className="bg-white">
          {/* Status Badge - Solo mostrar cuando esté suspendido */}
          {figuraComercial.suspendido && (
            <View className="absolute top-4 right-4 z-10">
              <View className="px-3 py-1 rounded-full shadow-sm bg-red-500">
                <Text className="text-white text-sm font-medium">
                  Suspendido
                </Text>
              </View>
            </View>
          )}
          
          {/* Main Info */}
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900">
              {figuraComercial.nombre}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              {figuraComercial.rif}
            </Text>
            {figuraComercial.tipoPersonaNombre && (
              <Text className="text-gray-500 text-sm mt-1">
                {figuraComercial.tipoPersonaNombre}
              </Text>
            )}
          </View>
        </View>

        {/* Detailed Information with Tabs */}
        {figuraComercial && !isLoading && (
          <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
            {/* Tab Header - Exactamente como ArticuloDetalle */}
            <View 
              className="px-4 py-3"
              style={{ backgroundColor: themes.sales.headerColor }}
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
                      { id: "ficha", name: "Ficha", icon: "person-outline" },
                      { id: "financiera", name: "Info. Financiera", icon: "card-outline" },
                    ].map((tab, index) => (
                      <TouchableOpacity
                        key={tab.id}
                        style={{
                          marginRight: index < 1 ? 8 : 0,
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
                      color={themes.sales.headerColor}
                    />
                    <Text style={{ color: themes.sales.headerColor }} className="ml-1 text-xs">
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
                            { id: "ficha", name: "Ficha", icon: "person-outline" },
                            { id: "financiera", name: "Info. Financiera", icon: "card-outline" },
                          ].find(tab => tab.id === activeDetailTab)?.icon as any || 'grid-outline'}
                          size={16}
                          color="white"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                          {[
                            { id: "ficha", name: "Ficha", icon: "person-outline" },
                            { id: "financiera", name: "Info. Financiera", icon: "card-outline" },
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
                        color={themes.sales.headerColor}
                      />
                      <Text style={{ color: themes.sales.headerColor }} className="ml-1 text-xs">
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
          { id: "ficha", name: "Ficha", icon: "person-outline" },
          { id: "financiera", name: "Info. Financiera", icon: "card-outline" },
        ]}
        activeOption={activeDetailTab}
        onSelectOption={setActiveDetailTab}
        position={dropdownPosition}
        theme={themes.sales}
      />
    </View>
  );
};

export default FiguraComercialDetalle;