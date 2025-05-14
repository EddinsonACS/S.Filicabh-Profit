import { getMockDataByCategory } from '@/components/Entidades/Inventario/InventoryMockdata';
import { Inventario } from '@/core/models/Inventario';
import { useInventory } from '@/hooks/Inventario/useInventory';
import { InventoryFormData } from '@/utils/schemas/inventorySchema';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';

// Import components
import CategorySelector from '@/components/Entidades/Inventario/CategorySelector';
import FormModal from '@/components/Entidades/Inventario/FormModal';
import InventoryHeader from '@/components/Entidades/Inventario/InventoryHeader';
import ItemsList from '@/components/Entidades/Inventario/ItemList';
import ItemModal from '@/components/Entidades/Inventario/ItemModal';
import LoadingState from '@/components/Entidades/Inventario/LoadingState';
import SearchBar from '@/components/Entidades/Inventario/SearchBar';
import { authStorage } from '@/data/global/authStorage';

const PAGE_SIZE = 10;

const EntInventario: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    useGetInventoryList,
    useCreateInventory,
    useUpdateInventory,
    useDeleteInventory
  } = useInventory();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Inventario | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('articulo');
  const [mockItems, setMockItems] = useState<Inventario[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<Inventario[]>([]);
  const { username } = authStorage();

  // React Query hooks - Para Almacén (sólo se ejecuta cuando la categoría seleccionada es 'almacen')
  const { data: inventoryData, isLoading: isLoadingApi } = useGetInventoryList(currentPage, PAGE_SIZE);
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  // Update hasMore and accumulate items when new data arrives
  useEffect(() => {
    if (inventoryData && selectedCategory === 'almacen') {
      const totalPages = Math.ceil(inventoryData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      // Accumulate items
      if (currentPage === 1) {
        setAccumulatedItems(inventoryData.data);
      } else {
        setAccumulatedItems(prev => [...prev, ...inventoryData.data]);
      }
    }
  }, [inventoryData, currentPage, selectedCategory]);

  // Cargar datos de prueba cuando cambia la categoría
  useEffect(() => {
    if (selectedCategory !== 'almacen') {
      const mockData = getMockDataByCategory(selectedCategory);
      setMockItems(mockData);
    }
  }, [selectedCategory]);

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

  // Estado de carga - depende de si estamos en almacén (donde usamos la API) o en categorías de prueba
  const isLoading = selectedCategory === 'almacen' ? isLoadingApi : false;

  // Datos combinados - API para almacén, mock para el resto
  const items = useMemo(() => {
    if (selectedCategory === 'almacen') {
      return accumulatedItems;
    } else {
      return mockItems;
    }
  }, [selectedCategory, accumulatedItems, mockItems]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Load more items when reaching the end
  const handleLoadMore = useCallback(() => {
    if (selectedCategory === 'almacen' && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [selectedCategory, hasMore, isLoading]);

  // CRUD operations
  const handleCreate = (formData: InventoryFormData) => {
    if (selectedCategory === 'almacen') {
      // Para almacén, usar la API real
      const newItem: Omit<Inventario, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
        nombre: formData.nombre,
        aplicaVentas: formData.aplicaVentas,
        aplicaCompras: formData.aplicaCompras,
        suspendido: formData.suspendido,
        otrosF1: new Date().toISOString(),
        otrosN1: 0,
        otrosN2: 0,
        equipo: "equipo",
        otrosC1: null,
        otrosC2: null,
        otrosC3: null,
        otrosC4: null,
        otrosT1: null
      };

      createMutation.mutate(newItem);
    } else {
      // Para otras categorías, usar datos de prueba locales
      const newItem: Inventario = {
        id: Math.floor(Math.random() * 10000) + 1000,
        nombre: formData.nombre,
        aplicaVentas: formData.aplicaVentas,
        aplicaCompras: formData.aplicaCompras,
        suspendido: formData.suspendido,
        otrosF1: new Date().toISOString(),
        otrosN1: 0,
        otrosN2: 0,
        equipo: "equipo",
        otrosC1: null,
        otrosC2: null,
        otrosC3: null,
        otrosC4: null,
        otrosT1: null,
        fechaRegistro: new Date().toISOString(),
        usuarioRegistroNombre: username || "usuario_local",
        fechaModificacion: new Date().toISOString(),
        usuarioModificacionNombre: username || "usuario_local"
      };

      setMockItems([...mockItems, newItem]);
    }

    setFormModalVisible(false);
  };

  const handleUpdate = (formData: InventoryFormData) => {
    if (!currentItem) return;

    if (selectedCategory === 'almacen') {
      // Para almacén, usar la API real
      const updatedItem: Omit<Inventario, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
        nombre: formData.nombre,
        aplicaVentas: formData.aplicaVentas,
        aplicaCompras: formData.aplicaCompras,
        suspendido: formData.suspendido,
        otrosF1: new Date().toISOString(),
        otrosN1: 0,
        equipo: "equipo",
        otrosN2: 0,
        otrosC1: currentItem.otrosC1, // Preservamos la configuración API existente
        otrosC2: null,
        otrosC3: null,
        otrosC4: null,
        otrosT1: null
      };

      updateMutation.mutate({ id: currentItem.id, data: updatedItem });
    } else {
      // Para otras categorías, actualizar datos de prueba locales
      const updatedItems = mockItems.map(item =>
        item.id === currentItem.id
          ? {
            ...item,
            nombre: formData.nombre,
            aplicaVentas: formData.aplicaVentas,
            aplicaCompras: formData.aplicaCompras,
            suspendido: formData.suspendido,
            fechaModificacion: new Date().toISOString(),
            usuarioModificacionNombre: username || "usuario_local"
          }
          : item
      );

      setMockItems(updatedItems);
    }

    setFormModalVisible(false);
  };

  const handleDelete = (id: number) => {
    if (selectedCategory === 'almacen') {
      // Para almacén, usar la API real
      deleteMutation.mutate(id);
    } else {
      // Para otras categorías, eliminar de datos de prueba locales
      setMockItems(mockItems.filter(item => item.id !== id));
    }
  };

  // Helper functions
  const showItemDetails = (item: Inventario) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: Inventario) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <InventoryHeader
        navigateToModules={navigateToModules}
        viewType={viewType}
        setViewType={setViewType}
        selectedCategory={selectedCategory}
      />

      <CategorySelector
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewType={viewType}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddPress={() => {
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
      />

      <View className="flex-1">
        {isLoading && currentPage === 1 ? (
          <LoadingState />
        ) : (
          <ItemsList
            items={filteredItems}
            handleDelete={handleDelete}
            showItemDetails={showItemDetails}
            openEditModal={openEditModal}
            onLoadMore={handleLoadMore}
            selectedCategory={selectedCategory}
            hasMore={hasMore}
          />
        )}
      </View>

      <FormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        selectedCategory={selectedCategory}
      />

      <ItemModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        currentItem={currentItem}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
      />
    </View>
  );
};

export default EntInventario;