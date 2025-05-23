import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import { themes } from '@/components/Entidades/shared/theme';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import { FORM_FIELDS_FINANZAS } from '@/utils/const/formFields';
import { DEFAULT_VALUES_FINANZAS } from '@/utils/const/defaultValues';
import ItemArticle from '@/components/Entidades/Finanzas/ItemArticle';
import { useBanco } from '@/hooks/Finanzas/useBanco';
import { useCaja } from '@/hooks/Finanzas/useCaja';
import { useCuentaBancaria } from '@/hooks/Finanzas/useCuentaBancaria';
import { finanzasSchema } from '@/utils/schemas/finanzasSchema';
import { useMoneda } from '@/hooks/Ventas/useMoneda';

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

  // React Query hooks
  const { data: bancoData, isLoading: isLoadingBanco } = useGetBancoList(currentPage, PAGE_SIZE);
  const { data: cajaData, isLoading: isLoadingCaja } = useGetCajaList(currentPage, PAGE_SIZE);
  const { data: cuentaBancariaData, isLoading: isLoadingCuentaBancaria } = useGetCuentaBancariaList(currentPage, PAGE_SIZE);

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
  const { data: monedasData } = useGetMonedaList(1, 1000);
  // Obtener todos los bancos para el selector de cuentas bancarias
  const { data: bancosData } = useGetBancoList(1, 1000);

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
    if (selectedCategory === 'banco' && bancoData) {
      const totalPages = Math.ceil(bancoData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(bancoData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = bancoData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    } else if (selectedCategory === 'caja' && cajaData) {
      const totalPages = Math.ceil(cajaData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(cajaData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = cajaData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    } else if (selectedCategory === 'cuentaBancaria' && cuentaBancariaData) {
      const totalPages = Math.ceil(cuentaBancariaData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(cuentaBancariaData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = cuentaBancariaData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [bancoData, cajaData, cuentaBancariaData, currentPage, selectedCategory]);

  const navigateToModules = () => {
    router.replace('/Entidades');
  };

  useEffect(() => {
    const backAction = () => {
      if (formModalVisible) {
        setFormModalVisible(false);
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

  const handleCreate = (formData: any) => {
    if (selectedCategory === 'banco') {
      createBancoMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'caja') {
      // Asegurarnos de que codigoMoneda sea un número
      const cajaData = {
        ...formData,
        codigoMoneda: Number(formData.codigoMoneda)
      };
      createCajaMutation.mutate(cajaData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'cuentaBancaria') {
      // Asegurarnos de que codigoBanco y codigoMoneda sean números
      const cuentaBancariaData = {
        ...formData,
        codigoBanco: Number(formData.codigoBanco),
        codigoMoneda: Number(formData.codigoMoneda)
      };
      createCuentaBancariaMutation.mutate(cuentaBancariaData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }
    setFormModalVisible(false);
  };

  const handleUpdate = (formData: any) => {
    if (!currentItem) return;

    if (selectedCategory === 'banco') {
      updateBancoMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'caja') {
      // Asegurarnos de que codigoMoneda sea un número
      const cajaData = {
        ...formData,
        codigoMoneda: Number(formData.codigoMoneda)
      };
      updateCajaMutation.mutate({ id: currentItem.id, formData: cajaData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'cuentaBancaria') {
      // Asegurarnos de que codigoBanco y codigoMoneda sean números
      const cuentaBancariaData = {
        ...formData,
        codigoBanco: Number(formData.codigoBanco),
        codigoMoneda: Number(formData.codigoMoneda)
      };
      updateCuentaBancariaMutation.mutate({ id: currentItem.id, formData: cuentaBancariaData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }
    setFormModalVisible(false);
    setDetailModalVisible(false);
  };

  const handleDelete = (id: number) => {
    if (selectedCategory === 'banco') {
      deleteBancoMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'caja') {
      deleteCajaMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'cuentaBancaria') {
      deleteCuentaBancariaMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }
    setDetailModalVisible(false);
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

      <DynamicItemList
        items={filteredItems}
        showItemDetails={showItemDetails}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        selectedCategory={selectedCategory}
        renderItem={renderItem}
        emptyStateComponent={
          <DynamicEmptyState
            icon="document-text-outline"
            title="No hay elementos en la lista"
            subtitle="Agrega un nuevo elemento para comenzar"
          />
        }
        keyExtractor={(item) => item.id.toString()}
      />

      <DynamicFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
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
      />
    </View>
  );
};

export default EntFinanzas;
