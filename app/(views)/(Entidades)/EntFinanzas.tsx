import ItemArticle from '@/components/Entidades/Finanzas/ItemArticle';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useBanco } from '@/hooks/Finanzas/useBanco';
import { useCaja } from '@/hooks/Finanzas/useCaja';
import { useCuentaBancaria } from '@/hooks/Finanzas/useCuentaBancaria';
import { useMoneda } from '@/hooks/Ventas/useMoneda';
import { DEFAULT_VALUES_FINANZAS } from '@/utils/const/defaultValues';
import { FORM_FIELDS_FINANZAS } from '@/utils/const/formFields';
import { finanzasSchema } from '@/utils/schemas/finanzasSchema';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BackHandler, View } from 'react-native';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: 'banco', label: 'Banco', icon: 'business' as const },
  { id: 'caja', label: 'Caja', icon: 'cash' as const },
  { id: 'cuentaBancaria', label: 'Cuenta Bancaria', icon: 'card' as const },
];

const CATEGORY_TITLES = {
  banco: 'Banco',
  caja: 'Caja',
  cuentaBancaria: 'Cuenta Bancaria',
} as const;

type CategoryId = keyof typeof CATEGORY_TITLES;

const EntFinanzas: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    useGetBancoList,
    useCreateBanco,
    useUpdateBanco,
    useDeleteBanco
  } = useBanco();

  const {
    useGetCajaList,
    useCreateCaja,
    useUpdateCaja,
    useDeleteCaja
  } = useCaja();

  const {
    useGetCuentaBancariaList,
    useCreateCuentaBancaria,
    useUpdateCuentaBancaria,
    useDeleteCuentaBancaria
  } = useCuentaBancaria();

  const {useGetMonedaList} = useMoneda();

  // Usar el nuevo sistema de notificaciones
  const { 
    showCreateSuccess, 
    showUpdateSuccess, 
    showDeleteSuccess,
    showError,
    showLoadError, 
  } = useNotificationContext();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('banco');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);
  const [backendFormError, setBackendFormError] = useState<string | null>(null);

  // React Query hooks
  const { data: bancoData, isLoading: isLoadingBanco, error: bancoError } = useGetBancoList(currentPage, PAGE_SIZE);
  const { data: cajaData, isLoading: isLoadingCaja, error: cajaError } = useGetCajaList(currentPage, PAGE_SIZE);
  const { data: cuentaBancariaData, isLoading: isLoadingCuentaBancaria, error: cuentaBancariaError } = useGetCuentaBancariaList(currentPage, PAGE_SIZE);

  const createBancoMutation = useCreateBanco();
  const updateBancoMutation = useUpdateBanco();
  const deleteBancoMutation = useDeleteBanco();

  const createCajaMutation = useCreateCaja();
  const updateCajaMutation = useUpdateCaja();
  const deleteCajaMutation = useDeleteCaja();

  const createCuentaBancariaMutation = useCreateCuentaBancaria();
  const updateCuentaBancariaMutation = useUpdateCuentaBancaria();
  const deleteCuentaBancariaMutation = useDeleteCuentaBancaria();

  // Obtener todas las monedas para los selectores
  const { data: monedasData, error: monedasError } = useGetMonedaList(1, 1000);
  // Obtener todos los bancos para el selector de cuentas bancarias
  const { data: bancosData, error: bancosError } = useGetBancoList(1, 1000);

  // Mostrar errores de carga
  useEffect(() => {
    if (bancoError && selectedCategory === 'banco') {
      showLoadError('la lista de bancos');
    }
    if (cajaError && selectedCategory === 'caja') {
      showLoadError('la lista de cajas');
    }
    if (cuentaBancariaError && selectedCategory === 'cuentaBancaria') {
      showLoadError('la lista de cuentas bancarias');
    }
    if (monedasError) {
      showLoadError('la lista de monedas');
    }
    if (bancosError) {
      showLoadError('la lista de bancos para el selector');
    }
  }, [bancoError, cajaError, cuentaBancariaError, monedasError, bancosError, selectedCategory, showLoadError]);

  // Lista de tipos de cuenta bancaria
  const tiposCuentaBancaria = [
    { id: 'C', nombre: 'C' },
    { id: 'A', nombre: 'A' },
    { id: 'O', nombre: 'O' }
  ];

  // Preparar los campos del formulario según la categoría seleccionada
  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS_FINANZAS[selectedCategory];
    
    if (selectedCategory === 'caja' && monedasData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoMoneda') {
          return {
            ...field,
            options: monedasData.data
          };
        }
        return field;
      });
    }
    
    if (selectedCategory === 'cuentaBancaria') {
      return fields.map(field => {
        // Agregar opciones de banco
        if (field.name === 'codigoBanco' && bancosData?.data) {
          return {
            ...field,
            options: bancosData.data
          };
        }
        // Agregar opciones de moneda
        if (field.name === 'codigoMoneda' && monedasData?.data) {
          return {
            ...field,
            options: monedasData.data
          };
        }
        // Agregar opciones de tipo de cuenta
        if (field.name === 'tipoDeCuenta') {
          return {
            ...field,
            options: tiposCuentaBancaria
          };
        }
        return field;
      });
    }
    
    return fields;
  }, [selectedCategory, monedasData, bancosData]);

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  // Update hasMore and accumulate items when new data arrives
  useEffect(() => {
    const processData = (data: any) => {
      if (!data) return;
      
      const totalPages = data.totalPaginas || Math.ceil(data.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(data.data || []);
      } else {
        setAccumulatedItems(prev => {
          if (!data.data || data.data.length === 0) {
            return prev;
          }
          
          const existingIds = new Map(prev.map((item: any) => [item.id, true]));
          
          const newItems = data.data.filter((item: any) => !existingIds.has(item.id));
          
          if (newItems.length === 0) {
            return prev;
          }
          
          return [...prev, ...newItems];
        });
      }
    };
    
    if (selectedCategory === 'banco' && bancoData) {
      processData(bancoData);
    } else if (selectedCategory === 'caja' && cajaData) {
      processData(cajaData);
    } else if (selectedCategory === 'cuentaBancaria' && cuentaBancariaData) {
      processData(cuentaBancariaData);
    }
  }, [bancoData, cajaData, cuentaBancariaData, currentPage, selectedCategory]);

  const navigateToModules = () => {
    router.replace('/Entidades');
  };

  useEffect(() => {
    const backAction = () => {
      if (formModalVisible) {
        setFormModalVisible(false);
        setBackendFormError(null);
        return true;
      }
      if (detailModalVisible) {
        setDetailModalVisible(false);
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandlerSubscription.remove();
  }, [formModalVisible, detailModalVisible, navigation]);

  const isLoading = selectedCategory === 'banco' ? isLoadingBanco : 
                    selectedCategory === 'caja' ? isLoadingCaja :
                    selectedCategory === 'cuentaBancaria' ? isLoadingCuentaBancaria : false;

  const items = useMemo(() => {
    return accumulatedItems;
  }, [accumulatedItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nroCuenta?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const handleCreate = async (formData: any): Promise<boolean> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      const commonOnSuccess = (createdItem: any, entityTypeString: string) => {
        queryClient.invalidateQueries({ queryKey: [selectedCategory] });
        setAccumulatedItems(prev => [createdItem, ...prev]);
        setCurrentPage(1);
        setHasMore(true);
        showCreateSuccess(entityTypeString);
        resolve(true);
      };
      const commonOnError = (error: any) => {
        const errorMessage = error.response?.data?.mensaje || error.message || 'Error al crear el elemento.';
        setBackendFormError(errorMessage);
        resolve(false);
      };

      if (selectedCategory === 'banco') {
        createBancoMutation.mutate(formData, {
          onSuccess: (createdItem) => commonOnSuccess(createdItem, 'el banco'),
          onError: commonOnError
        });
      } else if (selectedCategory === 'caja') {
        const cajaData = {
          ...formData,
          codigoMoneda: Number(formData.codigoMoneda)
        };
        createCajaMutation.mutate(cajaData, {
          onSuccess: (createdItem) => commonOnSuccess(createdItem, 'la caja'),
          onError: commonOnError
        });
      } else if (selectedCategory === 'cuentaBancaria') {
        const cuentaBancariaData = {
          ...formData,
          codigoBanco: Number(formData.codigoBanco),
          codigoMoneda: Number(formData.codigoMoneda)
        };
        createCuentaBancariaMutation.mutate(cuentaBancariaData, {
          onSuccess: (createdItem) => commonOnSuccess(createdItem, 'la cuenta bancaria'),
          onError: commonOnError
        });
      } else {
        console.warn('Unhandled category for create:', selectedCategory);
        setBackendFormError(`Categoría no manejada para la creación: ${selectedCategory}`);
        resolve(false);
      }
    });
  };

  const handleUpdate = async (formData: any): Promise<boolean> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      if (!currentItem) {
        setBackendFormError('No hay un elemento seleccionado para actualizar.');
        resolve(false);
        return;
      }

      const commonOnSuccess = (updatedItem: any, entityTypeString: string) => {
        queryClient.invalidateQueries({ queryKey: [selectedCategory] });
        setAccumulatedItems(prev =>
          prev.map(item => (item.id === currentItem.id ? updatedItem : item))
        );
        showUpdateSuccess(entityTypeString);
        resolve(true);
      };
      const commonOnError = (error: any) => {
        const errorMessage = error.response?.data?.mensaje || error.message || 'Error al actualizar el elemento.';
        setBackendFormError(errorMessage);
        resolve(false);
      };

      if (selectedCategory === 'banco') {
        updateBancoMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'el banco'),
          onError: commonOnError
        });
      } else if (selectedCategory === 'caja') {
        const cajaData = {
          ...formData,
          codigoMoneda: Number(formData.codigoMoneda)
        };
        updateCajaMutation.mutate({ id: currentItem.id, formData: cajaData }, {
          onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'la caja'),
          onError: commonOnError
        });
      } else if (selectedCategory === 'cuentaBancaria') {
        const cuentaBancariaData = {
          ...formData,
          codigoBanco: Number(formData.codigoBanco),
          codigoMoneda: Number(formData.codigoMoneda)
        };
        updateCuentaBancariaMutation.mutate({ id: currentItem.id, formData: cuentaBancariaData }, {
          onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'la cuenta bancaria'),
          onError: commonOnError
        });
      } else {
        console.warn('Unhandled category for update:', selectedCategory);
        setBackendFormError(`Categoría no manejada para la actualización: ${selectedCategory}`);
        resolve(false);
      }
    });
  };

  const handleDelete = (id: number) => {
    const commonOnSuccess = (entityTypeString: string) => {
      queryClient.invalidateQueries({ queryKey: [selectedCategory] });
      setAccumulatedItems(prev => prev.filter(item => item.id !== id));
      setCurrentPage(1);
      setHasMore(true);
      showDeleteSuccess(entityTypeString);
      setDetailModalVisible(false);
    };

    const commonOnError = (error: any, entityTypeString: string) => {
      const errorMessage = error.response?.data?.mensaje || error.message || `Error al eliminar ${entityTypeString.toLowerCase()}`;
      showError("Error", errorMessage);
      // Consider if modal should always close on delete error, currently it does.
      setDetailModalVisible(false);
    };

    if (selectedCategory === 'banco') {
      deleteBancoMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el banco'),
        onError: (err: any) => commonOnError(err, 'el banco')
      });
    } else if (selectedCategory === 'caja') {
      deleteCajaMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la caja'),
        onError: (err: any) => commonOnError(err, 'la caja')
      });
    } else if (selectedCategory === 'cuentaBancaria') {
      deleteCuentaBancariaMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la cuenta bancaria'),
        onError: (err: any) => commonOnError(err, 'la cuenta bancaria')
      });
    } else {
      console.warn('Unhandled category for delete:', selectedCategory);
      showError("Error", `Categoría no manejada para la eliminación: ${selectedCategory}`);
      setDetailModalVisible(false);
    }
  };

  const showItemDetails = (item: any) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <ItemArticle
        dataMoneda={monedasData?.data || []}
        dataBanco={bancosData?.data || []}
        item={item}
        category={selectedCategory}
        onPress={showItemDetails}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <DynamicHeader
        title="Finanzas"
        description="Gestión de finanzas y cuentas"
        backgroundColor={themes.finanzas.headerColor}
        textColor={themes.finanzas.headerTextColor}
        lightTextColor={themes.finanzas.buttonTextColor}
        buttonColor={themes.finanzas.buttonColor}
        viewType={viewType}
        setViewType={setViewType}
        navigateToModules={navigateToModules}
      />

      <DynamicCategorySelector<CategoryId>
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewType={viewType}
        categories={CATEGORIES}
        headerColor={themes.finanzas.headerColor}
        headerTextColor={themes.finanzas.headerTextColor}
        buttonColor={themes.finanzas.buttonColor}
        buttonTextColor={themes.finanzas.buttonTextColor}
      />

      <DynamicSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddPress={() => {
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
        placeholder="Buscar en finanzas..."
        addButtonText="Agregar Item"
        buttonColor={themes.finanzas.buttonColor}
        buttonTextColor={themes.finanzas.buttonTextColor}
      />

      <View className="flex-1">
          {isLoading && currentPage === 1 ? (
            <DynamicLoadingState color={themes.inventory.buttonColor} />
          ) : (
            <DynamicItemList
              items={filteredItems}
              handleDelete={handleDelete}
              showItemDetails={showItemDetails}
              openEditModal={openEditModal}
              onLoadMore={handleLoadMore}
              selectedCategory={selectedCategory}
              hasMore={hasMore}
              renderItem={renderItem}
              emptyStateComponent={
                <DynamicEmptyState
                  icon="document-text-outline"
                  title={`No hay ${CATEGORY_TITLES[selectedCategory].toLowerCase()}s en la lista`}
                  subtitle="Agrega un nuevo elemento para comenzar"
                />
              }
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>

      <DynamicFormModal
        visible={formModalVisible}
        onClose={() => {
          setFormModalVisible(false);
          setBackendFormError(null);
        }}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        selectedCategory={selectedCategory}
        schema={finanzasSchema[selectedCategory]}
        defaultValues={DEFAULT_VALUES_FINANZAS[selectedCategory]}
        categoryTitles={CATEGORY_TITLES}
        formFields={getFormFields()}
        headerColor={themes.finanzas.formHeaderColor}
        headerTextColor={themes.finanzas.formHeaderTextColor}
        buttonColor={themes.finanzas.formButtonColor}
        buttonTextColor={themes.finanzas.formButtonTextColor}
        switchActiveColor={themes.finanzas.switchActiveColor}
        switchInactiveColor={themes.finanzas.switchInactiveColor}
        backendError={backendFormError}
      />

      <DynamicItemModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        currentItem={currentItem}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        mainTitleField={{ 
          label: selectedCategory === 'cuentaBancaria' ? 'Número de Cuenta' : 'Nombre', 
          value: selectedCategory === 'cuentaBancaria' ? currentItem?.nroCuenta || '' : currentItem?.nombre || '' 
        }}
        badges={[
          {
            label: 'Estado',
            value: currentItem ? !currentItem.suspendido : false,
            activeIcon: 'ellipse',
            inactiveIcon: 'close-circle',
            color: themes.finanzas.badgeColor
          }
        ]}
        statusField={{
          value: currentItem ? !currentItem.suspendido : false,
          activeText: 'Activo',
          inactiveText: 'Inactivo'
        }}
        systemFields={currentItem ? [
          { label: 'ID', value: String(currentItem.id) },
          { label: 'Fecha de Registro', value: currentItem.fechaRegistro ? new Date(currentItem.fechaRegistro).toLocaleDateString() : '' },
          { label: 'Usuario Registro', value: currentItem.usuarioRegistroNombre || '' },
          ...(currentItem.fechaModificacion ? [{ label: 'Última Modificación', value: new Date(currentItem.fechaModificacion).toLocaleDateString() }] : [])
        ] : []}
        headerColor={themes.finanzas.itemHeaderColor}
        headerTextColor={themes.finanzas.itemHeaderTextColor}
        badgeColor={themes.finanzas.badgeColor}
        editButtonColor={themes.finanzas.editButtonColor}
        editButtonTextColor={themes.finanzas.editButtonTextColor}
        deleteButtonColor={themes.finanzas.deleteButtonColor}
        deleteButtonTextColor={themes.finanzas.deleteButtonTextColor}
        deleteButtonBorderColor={themes.finanzas.deleteButtonBorderColor}
      />
    </View>
  );
};

export default EntFinanzas;
