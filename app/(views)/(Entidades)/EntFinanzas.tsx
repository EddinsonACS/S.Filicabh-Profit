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
interface FinanceItem {
    id: string;
    name: string;
    description?: string;
    code?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    category: 'bank' | 'bankAccount' | 'cashRegister' | 'card' | 'paymentMethod';
}

interface CategorySection {
    id: string;
    title: string;
    icon: any; // Ionicons.glyphMap para TypeScript
    color: string;
    lightColor: string;
    category: string;
    route: string;
}

const CrudFinanzas: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('bank');
    const [items, setItems] = useState<FinanceItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<FinanceItem | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
        status: 'active'
    });

    // Categorías de finanzas
    const financeCategories: CategorySection[] = [
        {
            id: 'bank',
            title: 'Bancos',
            icon: 'business-outline',
            color: '#7e22ce',
            lightColor: '#f3e8ff',
            category: 'bank',
            route: '/finance/banks'
        },
        {
            id: 'bankAccount',
            title: 'Cuentas Bancarias',
            icon: 'card-outline',
            color: '#7e22ce',
            lightColor: '#f3e8ff',
            category: 'bankAccount',
            route: '/finance/bank-accounts'
        },
        {
            id: 'cashRegister',
            title: 'Cajas',
            icon: 'wallet-outline',
            color: '#7e22ce',
            lightColor: '#f3e8ff',
            category: 'cashRegister',
            route: '/finance/cash-registers'
        },
        {
            id: 'card',
            title: 'Tarjetas',
            icon: 'card-outline',
            color: '#7e22ce',
            lightColor: '#f3e8ff',
            category: 'card',
            route: '/finance/cards'
        },
        {
            id: 'paymentMethod',
            title: 'Formas de Pago',
            icon: 'cash-outline',
            color: '#7e22ce',
            lightColor: '#f3e8ff',
            category: 'paymentMethod',
            route: '/finance/payment-methods'
        }
    ];

    // Datos de ejemplo para simular la carga inicial
    const mockData: FinanceItem[] = [
        {
            id: '1',
            name: 'Banco Mercantil',
            description: 'Entidad financiera principal',
            code: 'BM001',
            status: 'active',
            createdAt: '2023-01-15',
            category: 'bank'
        },
        {
            id: '2',
            name: 'Banco Provincial',
            description: 'Entidad financiera secundaria',
            code: 'BP002',
            status: 'active',
            createdAt: '2023-02-20',
            category: 'bank'
        },
        {
            id: '3',
            name: 'Cuenta Corriente Principal',
            description: 'Cuenta para operaciones diarias',
            code: 'CC001',
            status: 'active',
            createdAt: '2023-03-10',
            category: 'bankAccount'
        },
        {
            id: '4',
            name: 'Caja Principal',
            description: 'Caja de la tienda central',
            code: 'CP001',
            status: 'active',
            createdAt: '2023-04-05',
            category: 'cashRegister'
        },
        {
            id: '5',
            name: 'Tarjeta Visa',
            description: 'Tarjeta corporativa principal',
            code: 'TV001',
            status: 'active',
            createdAt: '2023-05-12',
            category: 'card'
        },
        {
            id: '6',
            name: 'Pago en efectivo',
            description: 'Método de pago estándar',
            code: 'PE001',
            status: 'active',
            createdAt: '2023-06-18',
            category: 'paymentMethod'
        },
        {
            id: '7',
            name: 'Pago con tarjeta',
            description: 'Método de pago con tarjeta de crédito/débito',
            code: 'PT002',
            status: 'active',
            createdAt: '2023-07-22',
            category: 'paymentMethod'
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
        item.category === selectedCategory &&
        (searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Funciones CRUD (simuladas)
    const handleCreate = () => {
        // Simulación de creación
        const newItem: FinanceItem = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            code: formData.code,
            status: formData.status as 'active' | 'inactive',
            createdAt: new Date().toISOString().split('T')[0],
            category: selectedCategory as any
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
                    status: formData.status as 'active' | 'inactive'
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

    const showItemDetails = (item: FinanceItem) => {
        setCurrentItem(item);
        setDetailModalVisible(true);
    };

    const openEditModal = (item: FinanceItem) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            code: item.code || '',
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
            status: 'active'
        });
        setCurrentItem(null);
        setIsEditing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
            <View className="bg-purple-900 px-4 py-4">
                <Text className="text-white text-xl font-bold">Finanzas</Text>
                <Text className="text-purple-200 text-sm">Gestión financiera en Profit Plus</Text>
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
                    {financeCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${selectedCategory === category.category ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-gray-200'}`}
                            onPress={() => setSelectedCategory(category.category)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={selectedCategory === category.category ? '#7e22ce' : '#6b7280'}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                className={selectedCategory === category.category ? 'text-purple-900 font-medium' : 'text-gray-600'}
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
                    className="bg-purple-600 p-2 rounded-lg"
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
                    <ActivityIndicator size="large" color="#7e22ce" />
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
                                        <Text className="text-sm text-gray-500">Creado: {item.createdAt}</Text>
                                    </View>
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

                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">Estado</Text>
                            <View className="flex-row">
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-l-lg border ${formData.status === 'active' ? 'bg-purple-100 border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                                    onPress={() => setFormData({ ...formData, status: 'active' })}
                                >
                                    <Text className={`text-center ${formData.status === 'active' ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>Activo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-r-lg border ${formData.status === 'inactive' ? 'bg-purple-100 border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                                    onPress={() => setFormData({ ...formData, status: 'inactive' })}
                                >
                                    <Text className={`text-center ${formData.status === 'inactive' ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>Inactivo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

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
                                className="flex-1 bg-purple-600 py-3 rounded-lg ml-2"
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

                                <View className="bg-purple-50 rounded-lg p-4 mb-4">
                                    <Text className="text-2xl font-bold text-purple-900 mb-2">{currentItem.name}</Text>
                                    <View className={`self-start px-3 py-1 rounded-full ${currentItem.status === 'active' ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                                        <Text className={`text-sm font-medium ${currentItem.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                                            {currentItem.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-gray-500 mb-1">Código</Text>
                                    <Text className="text-gray-800">{currentItem.code || 'Sin código'}</Text>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-gray-500 mb-1">Fecha de creación</Text>
                                    <Text className="text-gray-800">{currentItem.createdAt}</Text>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-gray-500 mb-1">Categoría</Text>
                                    <Text className="text-gray-800">
                                        {financeCategories.find(cat => cat.category === currentItem.category)?.title || currentItem.category}
                                    </Text>
                                </View>

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

export default CrudFinanzas;
