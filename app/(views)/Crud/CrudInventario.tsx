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
    ActivityIndicator,
    Image
} from 'react-native';
import Animated, { SlideInRight, FadeIn } from 'react-native-reanimated';

// Definiciones de interfaces necesarias
interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    code?: string;
    category?: string;
    group?: string;
    section?: string;
    unit?: string;
    size?: string;
    color?: string;
    taxType?: string;
    articleType?: string;
    origin?: string;
    warehouse?: string;
    price?: number;
    stock?: number;
    image?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    type: 'article' | 'category' | 'group' | 'section' | 'unit' | 'size' | 'color' | 'taxType' | 'articleType' | 'origin' | 'warehouse';
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

const CrudInventario: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('article');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
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
        status: 'active'
    });

    // Categorías de inventario
    const inventoryCategories: CategorySection[] = [
        {
            id: 'article',
            title: 'Artículos',
            icon: 'pricetag-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'article',
            route: '/inventory/articles'
        },
        {
            id: 'category',
            title: 'Categoría',
            icon: 'folder-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'category',
            route: '/inventory/categories'
        },
        {
            id: 'group',
            title: 'Grupo',
            icon: 'albums-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'group',
            route: '/inventory/groups'
        },
        {
            id: 'section',
            title: 'Sección',
            icon: 'grid-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'section',
            route: '/inventory/sections'
        },
        {
            id: 'unit',
            title: 'Unidad',
            icon: 'resize-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'unit',
            route: '/inventory/units'
        },
        {
            id: 'size',
            title: 'Talla',
            icon: 'shirt-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'size',
            route: '/inventory/sizes'
        },
        {
            id: 'color',
            title: 'Color',
            icon: 'color-palette-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'color',
            route: '/inventory/colors'
        },
        {
            id: 'taxType',
            title: 'Tipo De Impuesto',
            icon: 'cash-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'taxType',
            route: '/inventory/tax-types'
        },
        {
            id: 'articleType',
            title: 'Tipo De Artículo',
            icon: 'list-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'articleType',
            route: '/inventory/article-types'
        },
        {
            id: 'origin',
            title: 'Origen',
            icon: 'flag-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'origin',
            route: '/inventory/origins'
        },
        {
            id: 'warehouse',
            title: 'Almacén',
            icon: 'home-outline',
            color: '#1e3a8a',
            lightColor: '#dbeafe',
            type: 'warehouse',
            route: '/inventory/warehouses'
        }
    ];

    // Datos de ejemplo para simular la carga inicial
    const mockData: InventoryItem[] = [
        {
            id: '1',
            name: 'Camisa Casual',
            description: 'Camisa manga larga casual para hombre',
            code: 'CC001',
            category: 'Ropa',
            group: 'Camisas',
            section: 'Hombre',
            unit: 'Unidad',
            size: 'M',
            color: 'Azul',
            taxType: 'IVA 16%',
            articleType: 'Producto Terminado',
            origin: 'Nacional',
            warehouse: 'Almacén Central',
            price: 25.99,
            stock: 50,
            image: 'https://placehold.co/100x100/blue/white?text=Camisa',
            status: 'active',
            createdAt: '2023-01-15',
            type: 'article'
        },
        {
            id: '2',
            name: 'Pantalón Formal',
            description: 'Pantalón formal para hombre',
            code: 'PF002',
            category: 'Ropa',
            group: 'Pantalones',
            section: 'Hombre',
            unit: 'Unidad',
            size: '32',
            color: 'Negro',
            taxType: 'IVA 16%',
            articleType: 'Producto Terminado',
            origin: 'Importado',
            warehouse: 'Almacén Central',
            price: 35.99,
            stock: 30,
            image: 'https://placehold.co/100x100/black/white?text=Pantalon',
            status: 'active',
            createdAt: '2023-02-20',
            type: 'article'
        },
        {
            id: '3',
            name: 'Ropa',
            description: 'Categoría para prendas de vestir',
            code: 'CAT001',
            status: 'active',
            createdAt: '2023-03-10',
            type: 'category'
        },
        {
            id: '4',
            name: 'Camisas',
            description: 'Grupo de productos tipo camisa',
            code: 'GRP001',
            status: 'active',
            createdAt: '2023-04-05',
            type: 'group'
        },
        {
            id: '5',
            name: 'Hombre',
            description: 'Sección para productos masculinos',
            code: 'SEC001',
            status: 'active',
            createdAt: '2023-05-12',
            type: 'section'
        },
        {
            id: '6',
            name: 'Unidad',
            description: 'Unidad estándar de medida',
            code: 'UNI001',
            status: 'active',
            createdAt: '2023-06-18',
            type: 'unit'
        },
        {
            id: '7',
            name: 'M',
            description: 'Talla mediana para ropa',
            code: 'TM001',
            status: 'active',
            createdAt: '2023-07-22',
            type: 'size'
        },
        {
            id: '8',
            name: 'Azul',
            description: 'Color azul estándar',
            code: 'COL001',
            status: 'active',
            createdAt: '2023-08-14',
            type: 'color'
        },
        {
            id: '9',
            name: 'IVA 16%',
            description: 'Impuesto al valor agregado estándar',
            code: 'IMP001',
            status: 'active',
            createdAt: '2023-09-05',
            type: 'taxType'
        },
        {
            id: '10',
            name: 'Producto Terminado',
            description: 'Artículo listo para venta',
            code: 'TIPART001',
            status: 'active',
            createdAt: '2023-10-10',
            type: 'articleType'
        },
        {
            id: '11',
            name: 'Nacional',
            description: 'Origen nacional',
            code: 'ORG001',
            status: 'active',
            createdAt: '2023-11-15',
            type: 'origin'
        },
        {
            id: '12',
            name: 'Almacén Central',
            description: 'Almacén principal de productos',
            code: 'ALM001',
            status: 'active',
            createdAt: '2023-12-20',
            type: 'warehouse'
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
            status: formData.status as 'active' | 'inactive',
            createdAt: new Date().toISOString().split('T')[0],
            type: selectedCategory as any
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

        // Campos adicionales solo para artículos
        if (selectedCategory === 'article') {
            return (
                <>
                    {basicFields}

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Categoría</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.category}
                            onChangeText={(text) => setFormData({ ...formData, category: text })}
                            placeholder="Seleccione categoría"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Grupo</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.group}
                            onChangeText={(text) => setFormData({ ...formData, group: text })}
                            placeholder="Seleccione grupo"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Precio</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            placeholder="Ingrese precio"
                            keyboardType="numeric"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Stock</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                            value={formData.stock}
                            onChangeText={(text) => setFormData({ ...formData, stock: text })}
                            placeholder="Ingrese stock"
                            keyboardType="numeric"
                        />
                    </View>
                </>
            );
        }

        return basicFields;
    };

    // Renderizar item según su tipo
    const renderItem = (item: InventoryItem) => {
        if (item.type === 'article') {
            return (
                <Animated.View
                    key={item.id}
                    entering={FadeIn.delay(items.indexOf(item) * 100).duration(300)}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3 overflow-hidden"
                >
                    <TouchableOpacity
                        className="p-4"
                        onPress={() => showItemDetails(item)}
                    >
                        <View className="flex-row">
                            {item.image && (
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-16 h-16 rounded-md mr-3"
                                />
                            )}

                            <View className="flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                                    <View className={`px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs font-medium ${item.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                                            {item.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-gray-600 mb-2" numberOfLines={2}>{item.description}</Text>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm text-gray-500">Código: {item.code}</Text>
                                    <Text className="text-sm font-medium text-blue-800">Bs. {item.price?.toFixed(2)}</Text>
                                </View>

                                <View className="flex-row justify-between mt-1">
                                    <Text className="text-sm text-gray-500">Stock: {item.stock}</Text>
                                    <Text className="text-sm text-gray-500">Categoría: {item.category}</Text>
                                </View>
                            </View>
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
            );
        } else {
            return (
                <Animated.View
                    key={item.id}
                    entering={FadeIn.delay(items.indexOf(item) * 100).duration(300)}
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
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
            <View className="bg-blue-900 px-4 py-4">
                <Text className="text-white text-xl font-bold">Inventario</Text>
                <Text className="text-blue-200 text-sm">Gestión de inventario en Profit Plus</Text>
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
                    {inventoryCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${selectedCategory === category.type ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
                            onPress={() => setSelectedCategory(category.type)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={selectedCategory === category.type ? '#1e3a8a' : '#6b7280'}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                className={selectedCategory === category.type ? 'text-blue-900 font-medium' : 'text-gray-600'}
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
                    className="bg-blue-600 p-2 rounded-lg"
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
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text className="mt-2 text-gray-600">Cargando datos...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 py-2">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => renderItem(item))
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
                                        className={`flex-1 py-2 rounded-l-lg border ${formData.status === 'active' ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                                        onPress={() => setFormData({ ...formData, status: 'active' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'active' ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>Activo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className={`flex-1 py-2 rounded-r-lg border ${formData.status === 'inactive' ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                                        onPress={() => setFormData({ ...formData, status: 'inactive' })}
                                    >
                                        <Text className={`text-center ${formData.status === 'inactive' ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>Inactivo</Text>
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
                                className="flex-1 bg-blue-600 py-3 rounded-lg ml-2"
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

                                {currentItem.image && currentItem.type === 'article' && (
                                    <Image
                                        source={{ uri: currentItem.image }}
                                        className="w-full h-40 rounded-lg mb-4"
                                        resizeMode="cover"
                                    />
                                )}

                                <View className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <Text className="text-2xl font-bold text-blue-900 mb-2">{currentItem.name}</Text>
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

                                    {currentItem.type === 'article' && (
                                        <>
                                            <View className="mb-4">
                                                <Text className="text-gray-500 mb-1">Categoría</Text>
                                                <Text className="text-gray-800">{currentItem.category || 'No asignada'}</Text>
                                            </View>

                                            <View className="mb-4">
                                                <Text className="text-gray-500 mb-1">Grupo</Text>
                                                <Text className="text-gray-800">{currentItem.group || 'No asignado'}</Text>
                                            </View>

                                            <View className="mb-4">
                                                <Text className="text-gray-500 mb-1">Precio</Text>
                                                <Text className="text-gray-800 font-medium">Bs. {currentItem.price?.toFixed(2) || '0.00'}</Text>
                                            </View>

                                            <View className="mb-4">
                                                <Text className="text-gray-500 mb-1">Stock</Text>
                                                <Text className="text-gray-800">{currentItem.stock || '0'} unidades</Text>
                                            </View>
                                        </>
                                    )}

                                    <View className="mb-4">
                                        <Text className="text-gray-500 mb-1">Fecha de creación</Text>
                                        <Text className="text-gray-800">{currentItem.createdAt}</Text>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-gray-500 mb-1">Tipo</Text>
                                        <Text className="text-gray-800">
                                            {inventoryCategories.find(cat => cat.type === currentItem.type)?.title || currentItem.type}
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

export default CrudInventario;