import { mockData } from '@/components/Entidades/Inventario/EntInventarioData';
import { FormDataType, InventoryItem } from '@/components/Entidades/Inventario/InventoryTypes';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';

// Import components
import CategorySelector from '@/components/Entidades/Inventario/CategorySelector';
import EmptyState from '@/components/Entidades/Inventario/EmptyState';
import FormModal from '@/components/Entidades/Inventario/FormModal';
import InventoryHeader from '@/components/Entidades/Inventario/InventoryHeader';
import ItemsList from '@/components/Entidades/Inventario/ItemList';
import ItemModal from '@/components/Entidades/Inventario/ItemModal';
import LoadingState from '@/components/Entidades/Inventario/LoadingState';
import SearchBar from '@/components/Entidades/Inventario/SearchBar';

const EntInventario: React.FC = () => {
  const navigation = useNavigation();

  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('article');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    code: '',
    category: '',
    group: '',
    section: '',
    unit: '',
    size: '',
    color: '',
    taxType: '',
    articleType: '',
    origin: '',
    warehouse: '',
    price: '',
    stock: '',
    image: '',
    status: 'active' as 'active' | 'inactive'
  });
  const router = useRouter();
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
      // Navigate back to main section
      navigation.goBack();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandlerSubscription.remove();
  }, [formModalVisible, detailModalVisible, navigation]);

  useEffect(() => {
    const loadData = () => {
      setTimeout(() => {
        setItems(mockData);
        setLoading(false);
      }, 800);
    };

    loadData();
  }, []);

  // Filter items by category and search
  const filteredItems = items.filter(item =>
    item.type === selectedCategory &&
    (searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // CRUD operations
  const handleCreate = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      code: formData.code,
      category: formData.category || undefined,
      group: formData.group || undefined,
      section: formData.section || undefined,
      unit: formData.unit || undefined,
      size: formData.size || undefined,
      color: formData.color || undefined,
      taxType: formData.taxType || undefined,
      articleType: formData.articleType || undefined,
      origin: formData.origin || undefined,
      warehouse: formData.warehouse || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      image: formData.image || undefined,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      type: selectedCategory as any
    };

    setItems([...items, newItem]);
    resetForm();
    setFormModalVisible(false);
  };

  const handleUpdate = () => {
    if (!currentItem) return;

    const updatedItems = items.map(item =>
      item.id === currentItem.id
        ? {
          ...item,
          name: formData.name,
          description: formData.description,
          code: formData.code,
          category: formData.category || item.category,
          group: formData.group || item.group,
          section: formData.section || item.section,
          unit: formData.unit || item.unit,
          size: formData.size || item.size,
          color: formData.color || item.color,
          taxType: formData.taxType || item.taxType,
          articleType: formData.articleType || item.articleType,
          origin: formData.origin || item.origin,
          warehouse: formData.warehouse || item.warehouse,
          price: formData.price ? parseFloat(formData.price) : item.price,
          stock: formData.stock ? parseInt(formData.stock) : item.stock,
          image: formData.image || item.image,
          status: formData.status
        }
        : item
    );

    setItems(updatedItems);
    resetForm();
    setFormModalVisible(false);
  };

  const handleDelete = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
  };

  // Helper functions
  const showItemDetails = (item: InventoryItem) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      code: item.code || '',
      category: item.category || '',
      group: item.group || '',
      section: item.section || '',
      unit: item.unit || '',
      size: item.size || '',
      color: item.color || '',
      taxType: item.taxType || '',
      articleType: item.articleType || '',
      origin: item.origin || '',
      warehouse: item.warehouse || '',
      price: item.price?.toString() || '',
      stock: item.stock?.toString() || '',
      image: item.image || '',
      status: item.status
    });
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      category: '',
      group: '',
      section: '',
      unit: '',
      size: '',
      color: '',
      taxType: '',
      articleType: '',
      origin: '',
      warehouse: '',
      price: '',
      stock: '',
      image: '',
      status: 'active'
    });
    setCurrentItem(null);
    setIsEditing(false);
  };

  return (
    <View>
      <InventoryHeader
        viewType={viewType}
        setViewType={setViewType}
        navigateToModules={navigateToModules}
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
          resetForm();
          setFormModalVisible(true);
        }}
      />

      {loading ? (
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

      {/* Updated FormModal with new styling */}
      <FormModal
        visible={formModalVisible}
        onClose={() => {
          resetForm();
          setFormModalVisible(false);
        }}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedCategory={selectedCategory}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
      />

      {/* Updated ItemModal with removed top buttons */}
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