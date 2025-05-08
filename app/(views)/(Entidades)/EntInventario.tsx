import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useInventory } from '@/hooks/Inventario/useInventory';
import { Inventario } from '@/core/models/Inventario';
import { InventoryFormData } from '@/utils/schemas/inventorySchema';

// Import components
import EmptyState from '@/components/Entidades/Inventario/EmptyState';
import FormModal from '@/components/Entidades/Inventario/FormModal';
import InventoryHeader from '@/components/Entidades/Inventario/InventoryHeader';
import ItemsList from '@/components/Entidades/Inventario/ItemList';
import ItemModal from '@/components/Entidades/Inventario/ItemModal';
import LoadingState from '@/components/Entidades/Inventario/LoadingState';
import SearchBar from '@/components/Entidades/Inventario/SearchBar';
import { authStorage } from '@/data/global/authStorage';

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
  const { username } = authStorage();

  // React Query hooks
  const { data: inventoryData, isLoading } = useGetInventoryList();
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();

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

  // Filter items by search
  const filteredItems = inventoryData?.data.filter(item =>
    (item.nombre as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.otrosC1 && (item.otrosC1 as string).toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // CRUD operations
  const handleCreate = (formData: InventoryFormData) => {
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
    setFormModalVisible(false);
  };

  const handleUpdate = (formData: InventoryFormData) => {
    if (!currentItem) return;

    const updatedItem: Omit<Inventario, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
      nombre: formData.nombre,
      aplicaVentas: formData.aplicaVentas,
      aplicaCompras: formData.aplicaCompras,
      suspendido: formData.suspendido,
      otrosF1: new Date().toISOString(),
      otrosN1: 0,
      equipo: "equipo",
      otrosN2: 0,
      otrosC1: null,
      otrosC2: null,
      otrosC3: null,
      otrosC4: null,
      otrosT1: null
    };

    updateMutation.mutate({ id: currentItem.id, data: updatedItem });
    setFormModalVisible(false);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
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
    <View className="flex-1">
      <InventoryHeader
        navigateToModules={navigateToModules}
        viewType={viewType}
        setViewType={setViewType}
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
        {isLoading ? (
          <LoadingState />
        ) : (
          filteredItems.length > 0 ? (
            <ItemsList
              items={filteredItems}
              handleDelete={handleDelete}
              showItemDetails={showItemDetails}
              openEditModal={openEditModal}
            />
          ) : (
            <EmptyState />
          )
        )}
      </View>

      <FormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
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
