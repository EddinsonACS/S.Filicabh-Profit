import DropdownOverlay from '@/components/common/DropdownOverlay';
import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useFiguraComercial } from '@/hooks/Ventas/useFiguraComercial';
import { useFiguraComercialForm } from '@/hooks/Ventas/useFiguraComercialForm';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const FiguraComercialForm: React.FC = () => {
  const router = useRouter();
  const { id, isEditing } = useLocalSearchParams<{ id?: string; isEditing?: string }>();
  const isEditingMode = isEditing === 'true';
  
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const dropdownButtonRef = useRef<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdFiguraId, setCreatedFiguraId] = useState<number | null>(null);

  const { 
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showError 
  } = useNotificationContext();

  // Datos para edición - primero obtener los datos
  const { useGetFiguraComercialItem, useCreateFiguraComercial, useUpdateFiguraComercial } = useFiguraComercial();
  const { data: currentItem, isLoading } = useGetFiguraComercialItem(Number(id));

  // Hook completo de formulario con pasos usando datos obtenidos
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    isDropdownOpen,
    toggleDropdown,
    isSubmitting,
    setIsSubmitting,
    esSucursal,
    setEsSucursal,
    manejaLimiteCredito,
    setManejaLimiteCredito,
    manejaLimiteDebito,
    setManejaLimiteDebito,
    shouldShowConditionalField,
    validateCurrentTab,
    processFormData,
    steps
  } = useFiguraComercialForm(currentItem);

  const createMutation = useCreateFiguraComercial();
  const updateMutation = useUpdateFiguraComercial();

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: currentItem || {}
  });

  // Configurar valores iniciales cuando se cargan los datos
  React.useEffect(() => {
    if (currentItem && isEditingMode) {
      reset(currentItem);
      setEsSucursal(currentItem.esSucursal || false);
      setManejaLimiteCredito((currentItem.montolimiteCreditoVentas || 0) > 0);
      setManejaLimiteDebito((currentItem.montolimiteCreditoCompras || 0) > 0);
    }
  }, [currentItem, isEditingMode, reset]);

  const handleDropdownPress = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setDropdownPosition({
          x: pageX,
          y: pageY,
          width: width
        });
        toggleDropdown();
      });
    }
  };

  const navigateBack = () => {
    if (isEditingMode && id) {
      // Si estamos editando, volver al detalle
      router.push(`/(views)/(Entidades)/FiguraComercialDetalle?id=${id}`);
    } else {
      // Si estamos creando, volver a la lista
      router.push('/(views)/(Entidades)/EntVentas?category=figuracomercial');
    }
  };

  const onSubmit = async (data: any) => {
    console.log('🚀 onSubmit ejecutándose. ActiveTab:', activeTab, 'isEditingMode:', isEditingMode);
    
    if (isSubmitting) {
      console.log('⚠️ Ya está enviando, retornando...');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validar pestaña actual
      const validation = validateCurrentTab(data);
      if (!validation.isValid) {
        showError('Error de Validación', validation.errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      // Procesar datos
      const processedData = processFormData(data);
      console.log('📊 Datos procesados:', processedData);

      if (activeTab === 'ficha') {
        if (isEditingMode) {
          // Actualizar figura comercial
          await updateMutation.mutateAsync({
            id: Number(id),
            formData: processedData
          });
          showUpdateSuccess('la figura comercial');
          setTimeout(() => {
            setActiveTab('financiera');
          }, 1500);
        } else {
          // Crear nueva figura comercial
          const result = await createMutation.mutateAsync(processedData);
          if (result && 'id' in result) {
            setCreatedFiguraId(result.id);
            showCreateSuccess('la figura comercial');
            setShowSuccessModal(true);
          }
        }
      } else if (activeTab === 'financiera') {
        const figuraId = isEditingMode ? Number(id) : createdFiguraId;
        
        if (figuraId) {
          await updateMutation.mutateAsync({
            id: figuraId,
            formData: processedData
          });
          
          if (isEditingMode) {
            showUpdateSuccess('la información financiera');
            setTimeout(() => {
              navigateBack();
            }, 1500);
          } else {
            showCreateSuccess('la información financiera');
            setShowSuccessModal(true);
          }
        }
      }
    } catch (error: any) {
      console.error('Error en onSubmit:', error);
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al procesar la solicitud';
      showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditingMode) {
    return (
      <View style={{ flex: 1 }} className="bg-gray-50">
        <View 
          className="px-4 pt-4 pb-4 flex-row items-center"
          style={{ backgroundColor: themes.sales.headerColor }}
        >
          <TouchableOpacity
            onPress={navigateBack}
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

  return (
    <View style={{ flex: 1 }} className="bg-gray-50">
      {/* Header */}
      <View 
        className="px-4 pt-2"
        style={{ backgroundColor: themes.sales.headerColor, minHeight: 80, zIndex: 1000 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={navigateBack}
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
              {isEditingMode ? 'Editar Figura Comercial' : 'Nueva Figura Comercial'}
            </Text>
          </View>
        </View>

        {/* Tab Navigation - En ambos modos */}
        {
          <View className="py-2">
            {viewMode === 'chips' ? (
              <View className="flex-row items-center justify-between py-3">
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 0 }}
                  style={{ flex: 1 }}
                >
                  {steps.map((tab, index) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={{
                        marginRight: index < 1 ? 8 : 0,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        borderWidth: 1,
                        borderColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                      onPress={() => setActiveTab(tab.id)}
                    >
                      <Ionicons
                        name={tab.icon as any}
                        size={14}
                        color={activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                          fontWeight: activeTab === tab.id ? '600' : 'normal',
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
                        name={steps.find(tab => tab.id === activeTab)?.icon as any || 'grid-outline'}
                        size={16}
                        color="white"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                        {steps.find(tab => tab.id === activeTab)?.name || 'Seleccionar sección'}
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
        }
      </View>

      {/* Form Content */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: 10,
          paddingTop: 8
        }}
      >
        {/* Form Content */}
        <View className="px-4">
              {activeTab === "ficha" && (
                <>
                  {/* Información Básica */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Información Básica</Text>
                    
                    {/* Nombre */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el nombre"
                        onChangeText={(value) => setValue('nombre', value)}
                        defaultValue={getValues('nombre')}
                      />
                    </View>

                    {/* RIF */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">RIF *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el RIF"
                        onChangeText={(value) => setValue('rif', value)}
                        defaultValue={getValues('rif')}
                      />
                    </View>

                    {/* NIT */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">NIT</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el NIT"
                        onChangeText={(value) => setValue('nit', value)}
                        defaultValue={getValues('nit')}
                      />
                    </View>

                    {/* Tipo de Persona */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Tipo de Persona *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del tipo de persona"
                        onChangeText={(value) => setValue('idTipoPersona', Number(value))}
                        defaultValue={String(getValues('idTipoPersona') || '')}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Es Sucursal */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">¿Es Sucursal?</Text>
                        <Switch
                          value={esSucursal}
                          onValueChange={(value) => {
                            setEsSucursal(value);
                            setValue('esSucursal', value);
                          }}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={esSucursal ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Casa Matriz - Condicional */}
                    {shouldShowConditionalField('idFiguraComercialCasaMatriz') && (
                      <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Casa Matriz *</Text>
                        <TextInput
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                          placeholder="Seleccione casa matriz"
                          onChangeText={(value) => setValue('idFiguraComercialCasaMatriz', Number(value))}
                          defaultValue={String(getValues('idFiguraComercialCasaMatriz') || '')}
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>

                  {/* Contacto */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</Text>
                    
                    {/* Teléfono */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Teléfono</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el teléfono"
                        onChangeText={(value) => setValue('telefono', value)}
                        defaultValue={getValues('telefono')}
                      />
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el email"
                        onChangeText={(value) => setValue('email', value)}
                        defaultValue={getValues('email')}
                        keyboardType="email-address"
                      />
                    </View>

                    {/* Email Alterno */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Email Alterno</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese el email alterno"
                        onChangeText={(value) => setValue('emailAlterno', value)}
                        defaultValue={getValues('emailAlterno')}
                        keyboardType="email-address"
                      />
                    </View>

                    {/* Persona de Contacto */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Persona de Contacto</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese la persona de contacto"
                        onChangeText={(value) => setValue('personaContacto', value)}
                        defaultValue={getValues('personaContacto')}
                      />
                    </View>
                  </View>

                  {/* Ubicación */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Ubicación</Text>
                    
                    {/* País */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">País *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del país"
                        onChangeText={(value) => setValue('idPais', Number(value))}
                        defaultValue={String(getValues('idPais') || '')}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Ciudad */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Ciudad *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID de la ciudad"
                        onChangeText={(value) => setValue('idCiudad', Number(value))}
                        defaultValue={String(getValues('idCiudad') || '')}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Clasificación */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Clasificación</Text>
                    
                    {/* Rubro */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Rubro</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del rubro"
                        onChangeText={(value) => setValue('idRubro', Number(value))}
                        defaultValue={String(getValues('idRubro') || '')}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Sector */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Sector</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del sector"
                        onChangeText={(value) => setValue('idSector', Number(value))}
                        defaultValue={String(getValues('idSector') || '')}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Vendedor */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Vendedor</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del vendedor"
                        onChangeText={(value) => setValue('idVendedor', Number(value))}
                        defaultValue={String(getValues('idVendedor') || '')}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Estado */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Estado</Text>
                    
                    {/* Suspendido */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Suspendido</Text>
                        <Switch
                          value={getValues('suspendido')}
                          onValueChange={(value) => setValue('suspendido', value)}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={getValues('suspendido') ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Direcciones */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Direcciones</Text>
                    
                    {/* Dirección Comercial */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Dirección Comercial</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese la dirección comercial"
                        onChangeText={(value) => setValue('direccionComercial', value)}
                        defaultValue={getValues('direccionComercial')}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Dirección de Entrega */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese la dirección de entrega"
                        onChangeText={(value) => setValue('direccionEntrega', value)}
                        defaultValue={getValues('direccionEntrega')}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Descripción */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Descripción</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Ingrese una descripción"
                        onChangeText={(value) => setValue('descripcionFiguraComercial', value)}
                        defaultValue={getValues('descripcionFiguraComercial')}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </>
              )}

              {activeTab === "financiera" && (
                <>
                  {/* Acuerdo de Pago */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Acuerdo de Pago</Text>
                    
                    {/* Acuerdo de Pago */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Acuerdo de Pago</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="ID del acuerdo de pago"
                        onChangeText={(value) => setValue('idAcuerdoDePago', Number(value))}
                        defaultValue={String(getValues('idAcuerdoDePago') || '')}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Configuración de Ventas */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Configuración de Ventas</Text>
                    
                    {/* Activo para Ventas */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Activo para Ventas</Text>
                        <Switch
                          value={getValues('activoVentas')}
                          onValueChange={(value) => setValue('activoVentas', value)}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={getValues('activoVentas') ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Maneja Límite de Crédito */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Maneja Límite de Crédito</Text>
                        <Switch
                          value={manejaLimiteCredito}
                          onValueChange={setManejaLimiteCredito}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={manejaLimiteCredito ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Campos de Límite de Crédito - Condicionales */}
                    {shouldShowConditionalField('idMonedaLimiteCreditoVentas') && (
                      <>
                        <View className="mb-4">
                          <Text className="text-sm font-medium text-gray-700 mb-1">Moneda Límite de Crédito *</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                            placeholder="ID de moneda"
                            onChangeText={(value) => setValue('idMonedaLimiteCreditoVentas', Number(value))}
                            defaultValue={String(getValues('idMonedaLimiteCreditoVentas') || '')}
                            keyboardType="numeric"
                          />
                        </View>

                        <View className="mb-4">
                          <Text className="text-sm font-medium text-gray-700 mb-1">Monto Límite de Crédito *</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                            placeholder="0.00"
                            onChangeText={(value) => setValue('montolimiteCreditoVentas', Number(value))}
                            defaultValue={String(getValues('montolimiteCreditoVentas') || '')}
                            keyboardType="numeric"
                          />
                        </View>
                      </>
                    )}
                  </View>

                  {/* Configuración de Compras */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Configuración de Compras</Text>
                    
                    {/* Activo para Compras */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Activo para Compras</Text>
                        <Switch
                          value={getValues('activoCompras')}
                          onValueChange={(value) => setValue('activoCompras', value)}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={getValues('activoCompras') ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Maneja Límite de Débito */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Maneja Límite de Débito</Text>
                        <Switch
                          value={manejaLimiteDebito}
                          onValueChange={setManejaLimiteDebito}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={manejaLimiteDebito ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Campos de Límite de Débito - Condicionales */}
                    {shouldShowConditionalField('idMonedaLimiteCreditoCompras') && (
                      <>
                        <View className="mb-4">
                          <Text className="text-sm font-medium text-gray-700 mb-1">Moneda Límite de Débito *</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                            placeholder="ID de moneda"
                            onChangeText={(value) => setValue('idMonedaLimiteCreditoCompras', Number(value))}
                            defaultValue={String(getValues('idMonedaLimiteCreditoCompras') || '')}
                            keyboardType="numeric"
                          />
                        </View>

                        <View className="mb-4">
                          <Text className="text-sm font-medium text-gray-700 mb-1">Monto Límite de Débito *</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                            placeholder="0.00"
                            onChangeText={(value) => setValue('montolimiteCreditoCompras', Number(value))}
                            defaultValue={String(getValues('montolimiteCreditoCompras') || '')}
                            keyboardType="numeric"
                          />
                        </View>
                      </>
                    )}
                  </View>

                  {/* Retenciones */}
                  <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Configuración de Retenciones</Text>
                    
                    {/* Aplica Retención Ventas Auto */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Aplica Ret. Ventas Auto.</Text>
                        <Switch
                          value={getValues('aplicaRetVentasAuto')}
                          onValueChange={(value) => setValue('aplicaRetVentasAuto', value)}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={getValues('aplicaRetVentasAuto') ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Aplica Retención Compras Auto */}
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Aplica Ret. Compras Auto.</Text>
                        <Switch
                          value={getValues('aplicaRetComprasAuto')}
                          onValueChange={(value) => setValue('aplicaRetComprasAuto', value)}
                          trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                          thumbColor={getValues('aplicaRetComprasAuto') ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    </View>

                    {/* Porcentaje Retención */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Porcentaje Retención (%)</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="0.00"
                        onChangeText={(value) => setValue('porceRetencionIvaCompra', Number(value))}
                        defaultValue={String(getValues('porceRetencionIvaCompra') || '')}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              )}


        </View>
        
        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          style={{ backgroundColor: themes.sales.buttonColor }}
          className={`flex-1 py-3 rounded-xl flex-row justify-center items-center shadow-sm ${
            isSubmitting ? "opacity-70" : ""
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Ionicons name="refresh" size={20} color="white" />
          ) : (
            <>
              <Ionicons 
                name={activeTab === 'financiera' ? "checkmark" : "arrow-forward"} 
                size={20} 
                color="white" 
                style={{ marginRight: 8 }} 
              />
              <Text className="text-white font-semibold">
                {activeTab === 'financiera' 
                  ? (isEditingMode ? 'Actualizar' : 'Finalizar') 
                  : 'Continuar'
                }
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-center text-gray-800">
              ¡{activeTab === 'ficha' ? 'Figura Comercial' : 'Información Financiera'} {isEditingMode ? 'Actualizada' : 'Creada'} Exitosamente!
            </Text>
            <Text className="text-gray-600 text-center mt-2 mb-6">
              {activeTab === 'ficha' 
                ? '¿Desea continuar con la información financiera?' 
                : 'La figura comercial ha sido configurada completamente.'
              }
            </Text>
            
            <View className="flex-row space-x-3">
              {/* No, salir */}
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  navigateBack();
                }}
                className="flex-1 py-3 px-6 rounded-xl border border-gray-300"
              >
                <Text className="text-gray-700 font-medium text-center">
                  {activeTab === 'ficha' ? 'No, salir' : 'Finalizar'}
                </Text>
              </TouchableOpacity>
              
              {/* Sí, continuar */}
              {activeTab === 'ficha' && (
                <TouchableOpacity
                  onPress={() => {
                    setShowSuccessModal(false);
                    setActiveTab('financiera');
                  }}
                  style={{ backgroundColor: themes.sales.buttonColor }}
                  className="flex-1 py-3 px-6 rounded-xl"
                >
                  <Text className="text-white font-medium text-center">Sí, continuar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Dropdown Overlay */}
      <DropdownOverlay
        isVisible={isDropdownOpen}
        onClose={() => toggleDropdown()}
        options={steps.map(step => ({
          id: step.id,
          name: step.name,
          icon: step.icon
        }))}
        activeOption={activeTab}
        onSelectOption={(option) => setActiveTab(option as any)}
        position={dropdownPosition}
        theme={themes.sales}
      />
    </View>
  );
};

export default FiguraComercialForm;