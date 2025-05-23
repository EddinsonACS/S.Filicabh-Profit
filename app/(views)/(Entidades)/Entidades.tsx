import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import CrudFinanzas from './EntFinanzas';
import CrudInventario from './EntInventario';
import CrudVentas from './EntVentas';

// Define section colors
const SECTION_COLORS = {
    home: "#1e3a8a",
    inventory: "#581c87",
    sales: "#15803d",
    finance: "#1e3a8a",
    profile: "#1e3a8a"
};

const Entidades: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState('home');

    // Get current section color
    const getCurrentColor = () => {
        return SECTION_COLORS[selectedTab as keyof typeof SECTION_COLORS] || SECTION_COLORS.home;
    };

    // Renderizar el contenido según la pestaña seleccionada
    const renderContent = () => {
        switch (selectedTab) {
            case 'inventory':
                return <CrudInventario />;
            case 'sales':
                return <CrudVentas />;
            case 'finance':
                return <CrudFinanzas />;
            default:
                return (
                    <ScrollView className="flex-1 p-4">
                        {/* Favoritos */}
                        <Text className="text-xl font-semibold text-gray-800 mb-3">Favoritos</Text>
                        <View className="flex-row justify-between mb-6">
                            <TouchableOpacity
                                className="bg-white w-[23%] rounded-xl shadow-sm border border-gray-100 p-2 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-1">
                                    <Ionicons name="cart" size={20} color={SECTION_COLORS.sales} />
                                </View>
                                <Text className="text-gray-800 text-xs font-medium text-center">Nueva venta</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-white w-[23%] rounded-xl shadow-sm border border-gray-100 p-2 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-1">
                                    <Ionicons name="bag-handle" size={20} color={SECTION_COLORS.sales} />
                                </View>
                                <Text className="text-gray-800 text-xs font-medium text-center">Nueva compra</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-white w-[23%] rounded-xl shadow-sm border border-gray-100 p-2 items-center"
                                onPress={() => setSelectedTab('sales')}
                            >
                                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-1">
                                    <Ionicons name="person-add" size={20} color={SECTION_COLORS.sales} />
                                </View>
                                <Text className="text-gray-800 text-xs font-medium text-center">Nuevo cliente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-white w-[23%] rounded-xl shadow-sm border border-gray-100 p-2 items-center"
                                onPress={() => setSelectedTab('inventory')}
                            >
                                <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mb-1">
                                    <Ionicons name="add-circle" size={20} color={SECTION_COLORS.inventory} />
                                </View>
                                <Text className="text-gray-800 text-xs font-medium text-center">Nuevo artículo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Botones principales */}
                        <Text className="text-xl font-semibold text-gray-800 mb-3">Módulos principales</Text>
                        <TouchableOpacity
                            className="bg-white w-full h-20 rounded-xl shadow-sm border border-gray-100 mb-4 flex-row items-center px-4"
                            onPress={() => setSelectedTab('inventory')}
                        >
                            <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mr-4">
                                <Ionicons name="cube-outline" size={28} color={SECTION_COLORS.inventory} />
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
                                <Ionicons name="cart-outline" size={28} color={SECTION_COLORS.sales} />
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
                            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                                <Ionicons name="cash-outline" size={28} color={SECTION_COLORS.finance} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg text-gray-800 font-medium">Finanzas</Text>
                                <Text className="text-gray-500">Gestión financiera y bancaria</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </ScrollView>
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
                        color={selectedTab === 'home' ? SECTION_COLORS.home : "#6b7280"}
                    />
                    <Text
                        className={`text-xs ${selectedTab === 'home' ? "text-blue-800" : "text-gray-500"}`}
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
                        color={selectedTab === 'inventory' ? SECTION_COLORS.inventory : "#6b7280"}
                    />
                    <Text
                        className={`text-xs ${selectedTab === 'inventory' ? "text-purple-700" : "text-gray-500"}`}
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
                        color={selectedTab === 'sales' ? SECTION_COLORS.sales : "#6b7280"}
                    />
                    <Text
                        className={`text-xs ${selectedTab === 'sales' ? "text-green-700" : "text-gray-500"}`}
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
                        color={selectedTab === 'finance' ? SECTION_COLORS.finance : "#6b7280"}
                    />
                    <Text
                        className={`text-xs ${selectedTab === 'finance' ? "text-blue-800" : "text-gray-500"}`}
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
                        color={selectedTab === 'profile' ? SECTION_COLORS.profile : "#6b7280"}
                    />
                    <Text
                        className={`text-xs ${selectedTab === 'profile' ? "text-blue-800" : "text-gray-500"}`}
                    >
                        Perfil
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Entidades;
