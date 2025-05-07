import { mockData } from '@/components/Entidades/Ventas/EntVentasData';
import { FormDataType, SalesItem } from '@/components/Entidades/Ventas/VentasTypes';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';

// Import components
import CategorySelector from '@/components/Entidades/Ventas/CategorySelector';
import EmptyState from '@/components/Entidades/Ventas/EmptyState';
import FormModal from '@/components/Entidades/Ventas/FormModal';
import ItemsList from '@/components/Entidades/Ventas/ItemList';
import ItemModal from '@/components/Entidades/Ventas/ItemModal';
import LoadingState from '@/components/Entidades/Ventas/LoadingState';
import SearchBar from '@/components/Entidades/Ventas/SearchBar';
import VentasHeader from '@/components/Entidades/Ventas/VentasHeader';

const EntVentas: React.FC = () => {
    const navigation = useNavigation();
    const router = useRouter();

    // State management
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('commercialFigure');
    const [items, setItems] = useState<SalesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<SalesItem | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        description: '',
        code: '',
        value: '',
        date: '',
        status: 'active' as 'active' | 'inactive'
    });

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

    // Load data
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
        const newItem: SalesItem = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description || undefined,
            code: formData.code || undefined,
            value: formData.value || undefined,
            date: formData.date || undefined,
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
                    description: formData.description || item.description,
                    code: formData.code || item.code,
                    value: formData.value || item.value,
                    date: formData.date || item.date,
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
    const showItemDetails = (item: SalesItem) => {
        setCurrentItem(item);
        setDetailModalVisible(true);
    };

    const openEditModal = (item: SalesItem) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            code: item.code || '',
            value: item.value || '',
            date: item.date || '',
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
            value: '',
            date: '',
            status: 'active'
        });
        setCurrentItem(null);
        setIsEditing(false);
    };

    return (
        <View>
            <VentasHeader
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
            {/* Form Modal */}
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
            {/* Item Detail Modal */}
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

export default EntVentas;
