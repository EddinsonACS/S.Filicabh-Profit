import { useAcuerdoDePago } from '@/hooks/Ventas/useAcuerdoDePago';
import { AcuerdoDePago } from '@/core/models/AcuerdoDePago';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

// Import dynamic components
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';
import DynamicErrorState from '@/components/Entidades/shared/DynamicErrorState';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: 'acuerdodepago', label: 'Acuerdo de Pago', icon: 'document-text' as const },
  { id: 'commercialFigure', label: 'Figura Comercial', icon: 'people' as const },
  { id: 'city', label: 'Ciudad', icon: 'business' as const },
  { id: 'region', label: 'Región', icon: 'map' as const },
  { id: 'country', label: 'País', icon: 'globe' as const },
  { id: 'deliveryMethod', label: 'Forma de Entrega', icon: 'car' as const },
  { id: 'personType', label: 'Tipo de Persona', icon: 'person' as const },
  { id: 'sellerType', label: 'Tipo de Vendedor', icon: 'briefcase' as const }
];

const CATEGORY_TITLES = {
  acuerdodepago: 'Acuerdo de Pago',
  commercialFigure: 'Figura Comercial',
  city: 'Ciudad',
  region: 'Región',
  country: 'País',
  deliveryMethod: 'Forma de Entrega',
  personType: 'Tipo de Persona',
  sellerType: 'Tipo de Vendedor'
};

const FORM_FIELDS = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text' as const,
    required: true,
    placeholder: 'Nombre del acuerdo de pago',
    description: 'Ingrese el nombre del acuerdo de pago.'
  }
];

const DEFAULT_VALUES = {
  nombre: ''
};

type CategoryId = keyof typeof CATEGORY_TITLES;

const EntVentas: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    useGetAcuerdoDePagoList,
    useCreateAcuerdoDePago,
    useUpdateAcuerdoDePago,
    useDeleteAcuerdoDePago
  } = useAcuerdoDePago();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<AcuerdoDePago | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('acuerdodepago');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<AcuerdoDePago[]>([]);
  const [error, setError] = useState<string | null>(null);

  // React Query hooks
  const { data: acuerdoDePagoData, isLoading: isLoadingApi } = useGetAcuerdoDePagoList(currentPage, PAGE_SIZE);
  const createMutation = useCreateAcuerdoDePago();
  const updateMutation = useUpdateAcuerdoDePago();
  const deleteMutation = useDeleteAcuerdoDePago();

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  // Update hasMore and accumulate items when new data arrives
  useEffect(() => {
    if (acuerdoDePagoData && selectedCategory === 'acuerdodepago') {
      const totalPages = Math.ceil(acuerdoDePagoData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(acuerdoDePagoData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = acuerdoDePagoData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [acuerdoDePagoData, currentPage, selectedCategory]);

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

  const isLoading = selectedCategory === 'acuerdodepago' ? isLoadingApi : false;

  const items = useMemo(() => {
    if (selectedCategory === 'acuerdodepago') {
      return accumulatedItems;
    } else {
      return []; // Empty array for other categories for now
    }
  }, [selectedCategory, accumulatedItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (selectedCategory === 'acuerdodepago' && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [selectedCategory, hasMore, isLoading]);

  const handleCreate = (formData: { nombre: string }) => {
    if (selectedCategory === 'acuerdodepago') {
      createMutation.mutate(formData, {
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

  const handleUpdate = (formData: { nombre: string }) => {
    if (!currentItem) return;

    if (selectedCategory === 'acuerdodepago') {
      updateMutation.mutate({ id: currentItem.id, data: formData }, {
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
    if (selectedCategory === 'acuerdodepago') {
      deleteMutation.mutate(id, {
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

  const showItemDetails = (item: AcuerdoDePago) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: AcuerdoDePago) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: AcuerdoDePago }) => (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => showItemDetails(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            ID: {item.id} · Creado: {new Date(item.fechaRegistro).toLocaleDateString()}
          </Text>
          <Text className="text-xs text-gray-400">
            Creado por: {item.usuarioRegistroNombre}
          </Text>
          <Text className="text-xs text-gray-400">
            Ultima modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <DynamicHeader
        navigateToModules={navigateToModules}
        viewType={viewType}
        setViewType={setViewType}
        title="Ventas y Compras"
        description="Gestión comercial en Profit Plus"
        backgroundColor="#15803d"
        textColor="#ffffff"
        lightTextColor="#dcfce7"
        buttonColor="#166534"
        categoryTitle={CATEGORY_TITLES[selectedCategory]}
      />

      <DynamicCategorySelector<CategoryId>
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewType={viewType}
        categories={CATEGORIES}
      />

      <DynamicSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddPress={() => {
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
      />

      <View className="flex-1">
        {error ? (
          <DynamicErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setCurrentPage(1);
              setHasMore(true);
              setAccumulatedItems([]);
            }}
          />
        ) : isLoading && currentPage === 1 ? (
          <DynamicLoadingState />
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
                title="No hay elementos en la lista"
                subtitle="Agrega un nuevo elemento para comenzar"
              />
            }
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>

      <DynamicFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        selectedCategory={selectedCategory}
        schema={z.object({
          nombre: z.string().min(1, 'El nombre es requerido')
        })}
        defaultValues={DEFAULT_VALUES}
        categoryTitles={CATEGORY_TITLES}
        formFields={FORM_FIELDS}
      />

      <DynamicItemModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        currentItem={currentItem}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        mainTitleField={{ label: 'Nombre', value: currentItem?.nombre || '' }}
        systemFields={currentItem ? [
          { label: 'ID', value: String(currentItem.id) },
          { label: 'Fecha de Registro', value: currentItem.fechaRegistro ? new Date(currentItem.fechaRegistro).toLocaleDateString() : '' },
          { label: 'Usuario Registro', value: currentItem.usuarioRegistroNombre || '' },
          ...(currentItem.fechaModificacion ? [{ label: 'Última Modificación', value: new Date(currentItem.fechaModificacion).toLocaleDateString() }] : [])
        ] : []}
        badges={[]}
        statusField={{ value: true, activeText: 'Activo', inactiveText: 'Inactivo' }}
      />
    </View>
  );
};

export default EntVentas;