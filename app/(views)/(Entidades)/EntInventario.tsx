import { getMockDataByCategory } from '@/components/Entidades/Inventario/InventoryMockdata';
import { Almacen } from '@/core/models/Almacen';
import { useAlmacen } from '@/hooks/Inventario/useAlmacen';
import { InventoryFormData, inventorySchema } from '@/utils/schemas/inventorySchema';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import { themes } from '@/components/Entidades/shared/theme';
import { authStorage } from '@/data/global/authStorage';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: 'almacen', label: 'Almacén', icon: 'business' as const },
  { id: 'articulo', label: 'Artículo', icon: 'cube' as const },
  { id: 'categoria', label: 'Categoría', icon: 'list' as const },
  { id: 'grupo', label: 'Grupo', icon: 'people' as const },
  { id: 'unidad', label: 'Unidad', icon: 'scale' as const },
  { id: 'color', label: 'Color', icon: 'color-palette' as const },
  { id: 'impuesto', label: 'Impuesto', icon: 'calculator' as const },
  { id: 'origen', label: 'Origen', icon: 'globe' as const }
];

const CATEGORY_TITLES = {
  almacen: 'Almacén',
  articulo: 'Artículo',
  categoria: 'Categoría',
  grupo: 'Grupo',
  unidad: 'Unidad',
  color: 'Color',
  impuesto: 'Impuesto',
  origen: 'Origen'
};

const FORM_FIELDS = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text' as const,
    required: true,
    placeholder: 'Nombre del item',
    description: 'Ingrese el nombre del elemento de inventario.'
  },
  {
    name: 'aplicaVentas',
    label: 'Aplica Ventas',
    type: 'switch' as const,
    description: 'El artículo está disponible para ventas'
  },
  {
    name: 'aplicaCompras',
    label: 'Aplica Compras',
    type: 'switch' as const,
    description: 'El artículo está disponible para compras'
  },
  {
    name: 'suspendido',
    label: 'Suspendido',
    type: 'switch' as const,
    description: 'El artículo está inactivo'
  }
];

const DEFAULT_VALUES = {
  nombre: '',
  aplicaVentas: false,
  aplicaCompras: false,
  suspendido: false
};

type CategoryId = keyof typeof CATEGORY_TITLES;

const EntInventario: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    useGetAlmacenList,
    useCreateAlmacen,
    useUpdateAlmacen,
    useDeleteAlmacen
  } = useAlmacen();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Almacen | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('almacen');
  const [mockItems, setMockItems] = useState<Almacen[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<Almacen[]>([]);
  const { username } = authStorage();
  const [error, setError] = useState<string | null>(null);

  // React Query hooks
  const { data: almacenData, isLoading: isLoadingApi } = useGetAlmacenList(currentPage, PAGE_SIZE);
  const createMutation = useCreateAlmacen();
  const updateMutation = useUpdateAlmacen();
  const deleteMutation = useDeleteAlmacen();

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  // Update hasMore and accumulate items when new data arrives
  useEffect(() => {
    if (almacenData && selectedCategory === 'almacen') {
      const totalPages = Math.ceil(almacenData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(almacenData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = almacenData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [almacenData, currentPage, selectedCategory]);

  // Load mock data when category changes
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

  const isLoading = selectedCategory === 'almacen' ? isLoadingApi : false;

  const items = useMemo(() => {
    if (selectedCategory === 'almacen') {
      return accumulatedItems;
    } else {
      return mockItems;
    }
  }, [selectedCategory, accumulatedItems, mockItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (selectedCategory === 'almacen' && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [selectedCategory, hasMore, isLoading]);

  const handleCreate = (formData: Partial<Almacen>) => {
    if (selectedCategory === 'almacen') {
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
    } else {
      const newItem: Almacen = {
        id: Math.floor(Math.random() * 10000) + 1000,
        nombre: formData.nombre || '',
        aplicaVentas: formData.aplicaVentas || false,
        aplicaCompras: formData.aplicaCompras || false,
        suspendido: formData.suspendido || false,
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

      setMockItems(prev => [newItem, ...prev]);
    }

    setFormModalVisible(false);
  };

  const handleUpdate = (formData: Partial<Almacen>) => {
    if (!currentItem) return;

    if (selectedCategory === 'almacen') {
      updateMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else {
      setMockItems(prev => prev.map(item =>
        item.id === currentItem.id
          ? {
            ...item,
            nombre: formData.nombre || item.nombre,
            aplicaVentas: formData.aplicaVentas ?? item.aplicaVentas,
            aplicaCompras: formData.aplicaCompras ?? item.aplicaCompras,
            suspendido: formData.suspendido ?? item.suspendido,
            fechaModificacion: new Date().toISOString(),
            usuarioModificacionNombre: username || "usuario_local"
          }
          : item
      ));
    }

    setFormModalVisible(false);
    setDetailModalVisible(false);
  };

  const handleDelete = (id: number) => {
    if (selectedCategory === 'almacen') {
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
    } else {
      setMockItems(prev => prev.filter(item => item.id !== id));
    }
    setDetailModalVisible(false);
  };

  const showItemDetails = (item: Almacen) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: Almacen) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: Almacen }) => (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => showItemDetails(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row space-x-2">
              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaVentas ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Ventas</Text>
              </View>

              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaCompras ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Compras</Text>
              </View>
            </View>

            <View className={`px-2 py-1 rounded-full ${item.suspendido
              ? 'bg-red-100 border border-red-600'
              : 'bg-green-100 border border-green-600'
              }`}>
              <Text className={`text-xs font-medium ${item.suspendido
                ? 'text-red-600'
                : 'text-green-600'
                }`}>
                {item.suspendido ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
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
        title="Inventario"
        description="Gestión de inventario y productos"
        backgroundColor={themes.inventory.headerColor}
        textColor={themes.inventory.headerTextColor}
        lightTextColor={themes.inventory.buttonTextColor}
        buttonColor={themes.inventory.buttonColor}
        viewType={viewType}
        setViewType={setViewType}
        navigateToModules={navigateToModules}
      />

          <DynamicCategorySelector
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            viewType={viewType}
          />

          <DynamicSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddPress={() => {
              setCurrentItem(null);
              setIsEditing(false);
              setFormModalVisible(true);
            }}
            placeholder="Buscar en inventario..."
            addButtonText="Agregar Item"
            buttonColor={themes.inventory.buttonColor}
            buttonTextColor={themes.inventory.buttonTextColor}
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
            schema={inventorySchema}
            defaultValues={DEFAULT_VALUES}
            categoryTitles={CATEGORY_TITLES}
            formFields={FORM_FIELDS}
            headerColor={themes.inventory.formHeaderColor}
            headerTextColor={themes.inventory.formHeaderTextColor}
            buttonColor={themes.inventory.formButtonColor}
            buttonTextColor={themes.inventory.formButtonTextColor}
            switchActiveColor={themes.inventory.switchActiveColor}
            switchInactiveColor={themes.inventory.switchInactiveColor}
          />

          <DynamicItemModal
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            currentItem={currentItem}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
            mainTitleField={{ label: 'Nombre', value: currentItem?.nombre || '' }}
            badges={[
              {
                label: 'Stock',
                value: currentItem?.otrosN1 ? currentItem.otrosN1 > 0 : false,
                activeIcon: 'ellipse',
                inactiveIcon: 'close-circle',
                color: themes.inventory.badgeColor
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
            headerColor={themes.inventory.itemHeaderColor}
            headerTextColor={themes.inventory.itemHeaderTextColor}
            badgeColor={themes.inventory.badgeColor}
            editButtonColor={themes.inventory.editButtonColor}
            editButtonTextColor={themes.inventory.editButtonTextColor}
            deleteButtonColor={themes.inventory.deleteButtonColor}
            deleteButtonTextColor={themes.inventory.deleteButtonTextColor}
          />
        </View>
  );
};

export default EntInventario;