import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import Animated, { SlideInRight, FadeIn } from 'react-native-reanimated';

// Definiciones de interfaces necesarias
interface SalesItem {
    id: string;
    name: string;
    description?: string;
    code?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    type: 'commercialFigure' | 'paymentAgreement' | 'city' | 'region' | 'country' | 'deliveryMethod' |
    'personType' | 'sellerType' | 'seller' | 'currency' | 'exchangeRate' | 'priceList' | 'sector' | 'category';
    value?: string;
    date?: string;
}

interface CategorySection {
    id: string;
    title: string;
    icon: any; // Ionicons.glyphMap para TypeScript
    color: string;
    lightColor: string;
    type: string;
    route: string;
}

const CrudVentas: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('commercialFigure');
    const [items, setItems] = useState<SalesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<SalesItem | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
        value: '',
        date: '',
        status: 'active'
    });

    // Categorías de ventas y compras
    const salesCategories: CategorySection[] = [
        {
            id: 'commercialFigure',
            title: 'Figura Comercial',
            icon: 'people-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'commercialFigure',
            route: '/sales/commercial-figure'
        },
        {
            id: 'paymentAgreement',
            title: 'Acuerdo de Pago',
            icon: 'document-text-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'paymentAgreement',
            route: '/sales/payment-agreements'
        },
        {
            id: 'city',
            title: 'Ciudad',
            icon: 'business-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'city',
            route: '/sales/cities'
        },
        {
            id: 'region',
            title: 'Región',
            icon: 'map-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'region',
            route: '/sales/regions'
        },
        {
            id: 'country',
            title: 'País',
            icon: 'globe-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'country',
            route: '/sales/countries'
        },
        {
            id: 'deliveryMethod',
            title: 'Forma De Entrega',
            icon: 'car-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'deliveryMethod',
            route: '/sales/delivery-methods'
        },
        {
            id: 'personType',
            title: 'Tipo Persona',
            icon: 'person-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'personType',
            route: '/sales/person-types'
        },
        {
            id: 'sellerType',
            title: 'Tipo Vendedor',
            icon: 'briefcase-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'sellerType',
            route: '/sales/seller-types'
        },
        {
            id: 'seller',
            title: 'Vendedor',
            icon: 'person-circle-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'seller',
            route: '/sales/sellers'
        },
        {
            id: 'currency',
            title: 'Moneda',
            icon: 'cash-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'currency',
            route: '/sales/currencies'
        },
        {
            id: 'exchangeRate',
            title: 'Tasa De Cambio',
            icon: 'trending-up-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'exchangeRate',
            route: '/sales/exchange-rates'
        },
        {
            id: 'priceList',
            title: 'Lista De Precio',
            icon: 'pricetags-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'priceList',
            route: '/sales/price-lists'
        },
        {
            id: 'sector',
            title: 'Sector',
            icon: 'location-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'sector',
            route: '/sales/sectors'
        },
        {
            id: 'category',
            title: 'Rubro',
            icon: 'bookmark-outline',
            color: '#15803d',
            lightColor: '#dcfce7',
            type: 'category',
            route: '/sales/categories'
        }
    ];

    // Datos de ejemplo para simular la carga inicial
    const mockData: SalesItem[] = [
        {
            id: '1',
            name: 'Cliente',
            description: 'Comprador habitual de productos',
            code: 'CLI001',
            status: 'active',
            createdAt: '2023-01-15',
            type: 'commercialFigure'
        },
        {
            id: '2',
            name: 'Proveedor',
            description: 'Suministrador de materias primas',
            code: 'PRO002',
            status: 'active',
            createdAt: '2023-02-20',
            type: 'commercialFigure'
        },
        {
            id: '3',
            name: 'Pago a 30 días',
            description: 'Pago a 30 días desde la emisión de factura',
            code: 'PAG001',
            status: 'active',
            createdAt: '2023-03-10',
            type: 'paymentAgreement'
        },
        {
            id: '4',
            name: 'Caracas',
            description: 'Capital de Venezuela',
            code: 'CCS001',
            status: 'active',
            createdAt: '2023-04-05',
            type: 'city'
        },
        {
            id: '5',
            name: 'Región Capital',
            description: 'Incluye Caracas y alrededores',
            code: 'RC001',
            status: 'active',
            createdAt: '2023-05-12',
            type: 'region'
        },
        {
            id: '6',
            name: 'Venezuela',
            description: 'República Bolivariana de Venezuela',
            code: 'VEN001',
            status: 'active',
            createdAt: '2023-06-18',
            type: 'country'
        },
        {
            id: '7',
            name: 'Envío terrestre',
            description: 'Entrega por vía terrestre',
            code: 'ET001',
            status: 'active',
            createdAt: '2023-07-22',
            type: 'deliveryMethod'
        },
        {
            id: '8',
            name: 'Persona natural',
            description: 'Individuo particular',
            code: 'PN001',
            status: 'active',
            createdAt: '2023-08-14',
            type: 'personType'
        },
        {
            id: '9',
            name: 'Vendedor interno',
            description: 'Personal de ventas interno',
            code: 'VI001',
            status: 'active',
            createdAt: '2023-09-05',
            type: 'sellerType'
        },
        {
            id: '10',
            name: 'Juan Pérez',
            description: 'Vendedor principal zona este',
            code: 'JP001',
            status: 'active',
            createdAt: '2023-10-10',
            type: 'seller'
        },
        {
            id: '11',
            name: 'Bolívar',
            description: 'Moneda local venezolana',
            code: 'BS001',
            status: 'active',
            createdAt: '2023-11-15',
            type: 'currency'
        },
        {
            id: '12',
            name: 'Tasa USD 05/2025',
            description: 'Tasa de cambio USD a Bs.',
            code: 'TC001',
            status: 'active',
            createdAt: '2023-12-20',
            type: 'exchangeRate',
            value: '35.75',
            date: '2025-05-01'
        },
        {
            id: '13',
            name: 'Lista precio mayorista',
            description: 'Precios para compras al por mayor',
            code: 'LPM001',
            status: 'active',
            createdAt: '2024-01-25',
            type: 'priceList'
        },
        {
            id: '14',
            name: 'Este',
            description: 'Sector este de la ciudad',
            code: 'SE001',
            status: 'active',
            createdAt: '2024-02-28',
            type: 'sector'
        },
        {
            id: '15',
            name: 'Textiles',
            description: 'Rubro de productos textiles',
            code: 'RUB001',
            status: 'active',
            createdAt: '2024-03-30',
            type: 'category'
        }
    ];

    // Efecto para cargar datos (simulado)
    useEffect(() => {
        const loadData = () => {
            setTimeout(() => {
                setItems(mockData);
                setLoading(false);
            }, 1000);
        };

        loadData();
    }, []);

    // Filtrar items por categoría y búsqueda
    const filteredItems = items.filter(item =>
        item.type === selectedCategory &&
        (searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Funciones CRUD (simuladas)
    const handleCreate = () => {
        // Simulación de creación
        const newItem: SalesItem = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            code: formData.code,
            status: formData.status as 'active' | 'inactive',
            createdAt: new Date().toISOString().split('T')[0],
            type: selectedCategory as any,
            value: formData.value || undefined,
            date: formData.date || undefined
        };

        setItems([...items, newItem]);
        resetForm();
        setModalVisible(false);

        // Mostrar mensaje de éxito
        Alert.alert("Éxito", "Elemento creado correctamente");
    };

    const handleUpdate = () => {
        if (!currentItem) return;

        // Simulación de actualización
        const updatedItems = items.map(item =>
            item.id === currentItem.id
                ? {
                    ...item,
                    name: formData.name,
                    description: formData.description,
                    code: formData.code,
                    status: formData.status as 'active' | 'inactive',
                    value: formData.value || item.value,
                    date: formData.date || item.date
                }
                : item
        );

        setItems(updatedItems);
        resetForm();
        setModalVisible(false);

        // Mostrar mensaje de éxito
        Alert.alert("Éxito", "Elemento actualizado correctamente");
    };

    const handleDelete = (id: string) => {
        // Confirmación antes de eliminar
        Alert.alert(
            "Confirmar eliminación",
            "¿Está seguro que desea eliminar este elemento?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: () => {
                        // Simulación de eliminación
                        const updatedItems = items.filter(item => item.id !== id);
                        setItems(updatedItems);

                        // Mostrar mensaje de éxito
                        Alert.alert("Éxito", "Elemento eliminado correctamente");
                    },
                    style: "destructive"
                }
            ]
        );
    };

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
        setModalVisible(true);
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

    // Determinar qué campos mostrar según la categoría seleccionada
    const renderFormFields = () => {
        const basicFields = (
            <>
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Nombre</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Ingrese nombre"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Descripción</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Ingrese descripción"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Código</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                        value={formData.code}
                        onChangeText={(text) => setFormData({ ...formData, code: text })}
                        placeholder="Ingrese código"
                    />
                </View>
            </>
        );

        // Campos adicionales para tipos específicos
        if (selectedCategory === 'exchangeRate') {
            return (
                <>
                    {basicFields}

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Valor</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.value}
                            onChangeText={(text) => setFormData({ ...formData, value: text })}
                            placeholder="Ingrese valor"
                            keyboardType="numeric"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Fecha</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.date}
                            onChangeText={(text) => setFormData({ ...formData, date: text })}
                            placeholder="AAAA-MM-DD"
                        />
                    </View>
                </>
            );
        }

        return basicFields;
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
            <View className="bg-green-900 px-4 py-4">
                <Text className="text-white text-xl font-bold">Ventas y Compras</Text>
                <Text className="text-green-200 text-sm">Gestión comercial en Profit Plus</Text>
            </View>

            {/* Categorías */}
            <Animated.View
                entering={SlideInRight.delay(200).duration(500)}
                className="py-2"
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                >
                    {salesCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${selectedCategory === category.type ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}
                            onPress={() => setSelectedCategory(category.type)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={selectedCategory === category.type ? '#15803d' : '#6b7280'}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                className={selectedCategory === category.type ? 'text-green-900 font-medium' : 'text-gray-600'}
                            >
                                {category.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Barra de búsqueda y botón de agregar */}
            <View className="flex-row items-center px-4 py-2">
                <View className="flex-1 bg-white rounded-lg border border-gray-200 flex-row items-center px-3 py-2 mr-2">
                    <Ionicons name="search-outline" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    className="bg-green-600 p-2 rounded-lg"
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Lista de elementos */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#15803d" />
                    <Text className="mt-2 text-gray-600">Cargando datos...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 py-2">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeIn.delay(index * 100).duration(300)}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3 overflow-hidden"
                            >
                                <TouchableOpacity
                                    className="p-4"
                                    onPress={() => showItemDetails(item)}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                                        <View className={`px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <Text className={`text-xs font-medium ${item.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                                                {item.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </Text>
                                        </View>
                                    </View>

                                    {item.description && (
                                        <Text className="text-gray-600 mb-2">{item.description}</Text>
                                    )}

                                    <View className="flex-row justify-between">
                                        <Text className="text-sm text-gray-500">Código: {item.code || 'N/A'}</Text>
                                        {item.type === 'exchangeRate' && item.value ? (
                                            <Text className="text-sm font-medium text-green-700">Valor: {item.value}</Text>
                                        ) : null}
                                    </View>

                                    {item.type === 'exchangeRate' && item.date ? (
                                        <Text className="text-sm text-gray-500 mt-1">Fecha: {item.date}</Text>
                                    ) : (
                                        <Text className="text-sm text-gray-500 mt-1">Creado: {item.createdAt}</Text>
                                    )}
                                </TouchableOpacity>

                                <View className="flex-row border-t border-gray-100">
                                    <TouchableOpacity
                                        className="flex-1 py-2 flex-row justify-center items-center"
                                        onPress={() => openEditModal(item)}
                                    >
                                        <Ionicons name="create-outline" size={16} color="#4f46e5" />
                                        <Text className="ml-1 text-indigo-700">Editar</Text>
                                    </TouchableOpacity>

                                    <View className="w-px bg-gray-100" />

                                    <TouchableOpacity
                                        className="flex-1 py-2 flex-row justify-center items-center"
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#dc2626" />
                                        <Text className="ml-1 text-red-600">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        ))
                    ) : (
                        <View className="flex-1 justify-center items-center py-10">
                            <Ionicons name="document-outline" size={48} color="#d1d5db" />
                            <Text className="mt-2 text-gray-400 text-center">No se encontraron elementos</Text>
                            <Text className="text-gray-400 text-center">Intenta con otra búsqueda o agrega un nuevo elemento</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Modal para crear/editar */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-4">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            {isEditing ? 'Editar elemento' : 'Nuevo elemento'}
                        </Text>

                        <ScrollView className="max-h-96">
                            {renderFormFields()}

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2">Estado</Text>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className={`flex-1 py-2 rounded-l-lg border ${formData.status === 'active' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}
                                        onPress={() => setFormData({ ...formData, status: 'active' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'active' ? 'text-green-900 font-medium' : 'text-gray-700'}`}>Activo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className={`flex-1 py-2 rounded-r-lg border ${formData.status === 'inactive' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}
                                        onPress={() => setFormData({ ...formData, status: 'inactive' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'inactive' ? 'text-green-900 font-medium' : 'text-gray-700'}`}>Inactivo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        <View className="flex-row mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                                onPress={() => {
                                    resetForm();
                                    setModalVisible(false);
                                }}
                            >
                                <Text className="text-center text-gray-800 font-medium">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-green-600 py-3 rounded-lg ml-2"
                                onPress={isEditing ? handleUpdate : handleCreate}
                            >
                                <Text className="text-center text-white font-medium">
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para ver detalles */}
            <Modal
                visible={detailModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-4">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

                        {currentItem && (
                            <>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-xl font-bold text-gray-800">Detalles</Text>
                                    <TouchableOpacity
                                        className="p-2"
                                        onPress={() => setDetailModalVisible(false)}
                                    >
                                        <Ionicons name="close" size={24} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>

                                <View className="bg-green-50 rounded-lg p-4 mb-4">
                                    <Text className="text-2xl font-bold text-green-900 mb-2">{currentItem.name}</Text>
                                    <View className={`self-start px-3 py-1 rounded-full ${currentItem.status === 'active' ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                                        <Text className={`text-sm font-medium ${currentItem.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                                            {currentItem.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>

                                <ScrollView className="max-h-96">
                                    <View className="mb-4">
                                        <Text className="text-gray-500 mb-1">Descripción</Text>
                                        <Text className="text-gray-800">{currentItem.description || 'Sin descripción'}</Text>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-gray-500 mb-1">Código</Text>
                                        <Text className="text-gray-800">{currentItem.code || 'Sin código'}</Text>
                                    </View>

                                    {currentItem.type === 'exchangeRate' && currentItem.value && (
                                        <View className="mb-4">
                                            <Text className="text-gray-500 mb-1">Valor</Text>
                                            <Text className="text-gray-800 font-medium">{currentItem.value}</Text>
                                        </View>
                                    )}

                                    {currentItem.type === 'exchangeRate' && currentItem.date ? (
                                        <View className="mb-4">
                                            <Text className="text-gray-500 mb-1">Fecha</Text>
                                            <Text className="text-gray-800">{currentItem.date}</Text>
                                        </View>
                                    ) : (
                                        <View className="mb-4">
                                            <Text className="text-gray-500 mb-1">Fecha de creación</Text>
                                            <Text className="text-gray-800">{currentItem.createdAt}</Text>
                                        </View>
                                    )}

                                    <View className="mb-4">
                                        <Text className="text-gray-500 mb-1">Tipo</Text>
                                        <Text className="text-gray-800">
                                            {salesCategories.find(cat => cat.type === currentItem.type)?.title || currentItem.type}
                                        </Text>
                                    </View>
                                </ScrollView>

                                <View className="flex-row mt-6">
                                    <TouchableOpacity
                                        className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                                        onPress={() => {
                                            setDetailModalVisible(false);
                                            openEditModal(currentItem);
                                        }}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#4f46e5" style={{ marginRight: 6 }} />
                                        <Text className="text-indigo-700 font-medium">Editar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 bg-red-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
                                        onPress={() => {
                                            setDetailModalVisible(false);
                                            handleDelete(currentItem.id);
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                                        <Text className="text-red-700 font-medium">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CrudVentas;