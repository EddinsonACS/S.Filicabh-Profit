import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CrudInventario from './CrudInventario';
import CrudVentas from './CrudVentas';
import CrudFinanzas from './CrudIFinanzas';

const MainNavigation: React.FC = () => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('home');

    // Renderizar el contenido según la pestaña seleccionada
    const renderContent = () => {
        switch (selectedTab) {
            case 'inventory':
                return <CrudInventario />;
            case 'sales':
                return <CrudVentas />;
            case 'finance':
                return <CrudFinanzas />;
            case 'profile':
                return (
                    <View className="flex-1 justify-center items-center bg-gray-50">
                        <Ionicons name="person-circle-outline" size={100} color="#6b7280" />
                        <Text className="text-xl font-semibold text-gray-700 mt-4">Perfil de Usuario</Text>
                        <Text className="text-gray-500 mt-2">Gestión de cuenta en Profit Plus</Text>
                    </View>
                );
            default:
                return (
                    <View className="flex-1 p-4">

                        {/* Botones principales */}
                        <TouchableOpacity
                            className="bg-white w-full h-20 rounded-xl shadow-sm border border-gray-100 mb-4 flex-row items-center px-4"
                            onPress={() => setSelectedTab('inventory')}
                        >
                            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                                <Ionicons name="cube-outline" size={28} color="#1e3a8a" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg text-gray-800 font-medium">Inventario</Text>
                                <Text className="text-gray-500">Gestión de productos y existencias</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white w-full h-20 rounded-xl shadow-sm border border-gray-100 mb-4 flex-row items-center px-4"
                            onPress={() => setSelectedTab('sales')}
                        >
                            <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mr-4">
                                <Ionicons name="cart-outline" size={28} color="#15803d" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg text-gray-800 font-medium">Ventas y Compras</Text>
                                <Text className="text-gray-500">Gestión comercial y proveedores</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white w-full h-20 rounded-xl shadow-sm border border-gray-100 mb-4 flex-row items-center px-4"
                            onPress={() => setSelectedTab('finance')}
                        >
                            <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mr-4">
                                <Ionicons name="cash-outline" size={28} color="#7e22ce" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg text-gray-800 font-medium">Finanzas</Text>
                                <Text className="text-gray-500">Gestión financiera y bancaria</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        {/* Acciones rápidas */}
                        <Text className="text-xl font-semibold text-gray-800 mt-6 mb-4">Acciones rápidas</Text>

                        <View className="flex-row flex-wrap justify-between">
                            <TouchableOpacity
                                className="bg-white w-[48%] rounded-xl shadow-sm border border-gray-100 mb-4 p-4 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-2">
                                    <Ionicons name="cart" size={24} color="#dc2626" />
                                </View>
                                <Text className="text-gray-800 font-medium">Nueva venta</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-white w-[48%] rounded-xl shadow-sm border border-gray-100 mb-4 p-4 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                                    <Ionicons name="bag-handle" size={24} color="#2563eb" />
                                </View>
                                <Text className="text-gray-800 font-medium">Nueva compra</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-white w-[48%] rounded-xl shadow-sm border border-gray-100 mb-4 p-4 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mb-2">
                                    <Ionicons name="person-add" size={24} color="#059669" />
                                </View>
                                <Text className="text-gray-800 font-medium">Nuevo cliente</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-white w-[48%] rounded-xl shadow-sm border border-gray-100 mb-4 p-4 items-center"
                                onPress={() => setSelectedTab('inventory')}
                            >
                                <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-2">
                                    <Ionicons name="add-circle" size={24} color="#7c3aed" />
                                </View>
                                <Text className="text-gray-800 font-medium">Nuevo artículo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9F8FD]">
            <View className="flex-1">
                {renderContent()}
            </View>

            {/* Barra de navegación inferior */}
            <View className="h-16 bg-white border-t border-gray-200 flex-row items-center justify-around px-4">
                <TouchableOpacity
                    className="items-center"
                    onPress={() => setSelectedTab('home')}
                >
                    <Ionicons
                        name="home"
                        size={24}
                        color={selectedTab === 'home' ? "#1e3a8a" : "#6b7280"}
                    />
                    <Text
                        className={selectedTab === 'home' ? "text-xs text-blue-800" : "text-xs text-gray-500"}
                    >
                        Inicio
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center"
                    onPress={() => setSelectedTab('inventory')}
                >
                    <Ionicons
                        name="cube-outline"
                        size={24}
                        color={selectedTab === 'inventory' ? "#1e3a8a" : "#6b7280"}
                    />
                    <Text
                        className={selectedTab === 'inventory' ? "text-xs text-blue-800" : "text-xs text-gray-500"}
                    >
                        Inventario
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center"
                    onPress={() => setSelectedTab('sales')}
                >
                    <Ionicons
                        name="cart-outline"
                        size={24}
                        color={selectedTab === 'sales' ? "#1e3a8a" : "#6b7280"}
                    />
                    <Text
                        className={selectedTab === 'sales' ? "text-xs text-blue-800" : "text-xs text-gray-500"}
                    >
                        Ventas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center"
                    onPress={() => setSelectedTab('finance')}
                >
                    <Ionicons
                        name="cash-outline"
                        size={24}
                        color={selectedTab === 'finance' ? "#1e3a8a" : "#6b7280"}
                    />
                    <Text
                        className={selectedTab === 'finance' ? "text-xs text-blue-800" : "text-xs text-gray-500"}
                    >
                        Finanzas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center"
                    onPress={() => setSelectedTab('profile')}
                >
                    <Ionicons
                        name="person-outline"
                        size={24}
                        color={selectedTab === 'profile' ? "#1e3a8a" : "#6b7280"}
                    />
                    <Text
                        className={selectedTab === 'profile' ? "text-xs text-blue-800" : "text-xs text-gray-500"}
                    >
                        Perfil
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default MainNavigation;