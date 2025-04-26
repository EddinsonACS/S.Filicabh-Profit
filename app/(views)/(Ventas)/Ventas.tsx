import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../../components/LoadingScreen';

// Tipos para las opciones del menú
type MenuOption = {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    route: string;
};

// Definición de las opciones del menú de ventas
const menuOptions: MenuOption[] = [
    {
        id: 'agents',
        title: 'Agentes Comerciales',
        description: 'Gestiona tus clientes y leads de ventas',
        icon: 'people-outline',
        color: '#1e40af',
        bgColor: '#dbeafe',
        route: '/Ventas/AgentesComerciales'
    },
    {
        id: 'orders',
        title: 'Pedidos',
        description: 'Crea y administra pedidos de clientes',
        icon: 'cart-outline',
        color: '#059669',
        bgColor: '#d1fae5',
        route: '/Ventas/Pedidos'
    },
    {
        id: 'payments',
        title: 'Cobros',
        description: 'Gestiona pagos y estado de cuenta',
        icon: 'cash-outline',
        color: '#7e22ce',
        bgColor: '#f3e8ff',
        route: '/Ventas/Cobros'
    },
    {
        id: 'retentions',
        title: 'Retenciones',
        description: 'Administra retenciones de impuestos',
        icon: 'document-text-outline',
        color: '#b45309',
        bgColor: '#fef3c7',
        route: '/Ventas/Retenciones'
    }
];

// Tipos para las notificaciones
type Notification = {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    createdAt: Date;
    read: boolean;
};

// Enum para el tipo de visualización
enum ViewType {
    Grid = 'grid',
    List = 'list'
}

export default function Ventas() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [viewType, setViewType] = useState<ViewType>(ViewType.Grid);

    // Simulamos algunas notificaciones recientes
    const recentNotifications: Notification[] = [
        {
            id: '1',
            title: 'Nuevo pedido',
            description: 'El cliente ABC ha realizado un nuevo pedido',
            icon: 'cart-outline',
            color: '#059669',
            createdAt: new Date(),
            read: false
        },
        {
            id: '2',
            title: 'Pago recibido',
            description: 'Se ha registrado un nuevo pago de $45,600',
            icon: 'cash-outline',
            color: '#1e40af',
            createdAt: new Date(Date.now() - 3600000), // 1 hora atrás
            read: false
        }
    ];

    // Simulamos carga inicial
    React.useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    // Navegación a la vista específica
    const navigateTo = (route: string) => {
        router.push(route as any);
    };

    // Cambiar tipo de visualización
    const toggleViewType = () => {
        setViewType(viewType === ViewType.Grid ? ViewType.List : ViewType.Grid);
    };

    // Formatear tiempo relativo
    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} h`;

        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} d`;
    };

    if (isLoading) {
        return <LoadingScreen message="Cargando módulo de ventas" />;
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
            {/* Cabecera */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="bg-blue-800 pt-4 pb-5 px-4"
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-white text-2xl font-bold">Ventas</Text>

                    <View className="flex-row">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-blue-700 items-center justify-center mr-2"
                            onPress={toggleViewType}
                        >
                            <Ionicons
                                name={viewType === ViewType.Grid ? 'list-outline' : 'grid-outline'}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-blue-700 items-center justify-center"
                            onPress={() => navigateTo('/Ventas/Buscar')}
                        >
                            <Ionicons name="search-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Resumen */}
                <View className="flex-row mt-5 justify-between">
                    <View className="bg-blue-700 rounded-xl p-3" style={{ width: '48%' }}>
                        <Text className="text-blue-100 text-sm">Ventas del mes</Text>
                        <Text className="text-white text-xl font-bold">$430,500</Text>
                    </View>

                    <View className="bg-blue-700 rounded-xl p-3" style={{ width: '48%' }}>
                        <Text className="text-blue-100 text-sm">Pedidos pendientes</Text>
                        <Text className="text-white text-xl font-bold">12</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Notificaciones recientes */}
            {recentNotifications.length > 0 && (
                <Animated.View
                    entering={SlideInUp.duration(400).delay(200)}
                    className="px-4 py-3"
                >
                    <Text className="text-gray-700 font-medium mb-2">Notificaciones recientes</Text>

                    {recentNotifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            className="bg-white rounded-xl p-3 mb-2 flex-row items-center"
                            onPress={() => console.log(`Notification ${notification.id} pressed`)}
                        >
                            <View style={{ backgroundColor: `${notification.color}20` }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                <Ionicons name={notification.icon} size={20} color={notification.color} />
                            </View>

                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-gray-800 font-medium flex-1">{notification.title}</Text>
                                    <Text className="text-gray-500 text-xs">{getRelativeTime(notification.createdAt)}</Text>
                                </View>
                                <Text className="text-gray-600 text-sm mt-1">{notification.description}</Text>
                            </View>

                            {!notification.read && (
                                <View className="w-3 h-3 rounded-full bg-blue-600 ml-2" />
                            )}
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* Menú principal */}
            <Animated.View
                entering={SlideInUp.duration(400).delay(300)}
                className="px-4 py-3"
            >
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-700 font-medium">Módulos de ventas</Text>
                </View>

                {/* Visualización de cuadrícula */}
                {viewType === ViewType.Grid && (
                    <View className="flex-row flex-wrap justify-between">
                        {menuOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={{ width: '48%', marginBottom: 12 }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                                onPress={() => navigateTo(option.route)}
                            >
                                <View style={{ backgroundColor: option.bgColor }} className="w-12 h-12 rounded-full items-center justify-center mb-3">
                                    <Ionicons name={option.icon} size={24} color={option.color} />
                                </View>

                                <Text className="text-gray-800 font-semibold mb-1">{option.title}</Text>
                                <Text className="text-gray-600 text-xs">{option.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Visualización de lista */}
                {viewType === ViewType.List && (
                    <View className="rounded-xl overflow-hidden border border-gray-200">
                        {menuOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                className={`bg-white p-4 flex-row items-center ${index < menuOptions.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                onPress={() => navigateTo(option.route)}
                            >
                                <View style={{ backgroundColor: option.bgColor }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                    <Ionicons name={option.icon} size={20} color={option.color} />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium">{option.title}</Text>
                                    <Text className="text-gray-600 text-xs mt-1">{option.description}</Text>
                                </View>

                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </Animated.View>

            {/* Estadísticas rápidas */}
            <Animated.View
                entering={SlideInUp.duration(400).delay(400)}
                className="px-4 py-3"
            >
                <Text className="text-gray-700 font-medium mb-3">Estadísticas rápidas</Text>

                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-gray-800">Desempeño mensual</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-800">Ver más</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Nuevos agentes comerciales</Text>
                        <Text className="font-medium text-gray-800">15</Text>
                    </View>

                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <Animated.View
                            className="h-full bg-blue-800 rounded-full"
                            style={{ width: '65%' }}
                        />
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Pedidos completados</Text>
                        <Text className="font-medium text-gray-800">32 / 45</Text>
                    </View>

                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <Animated.View
                            className="h-full bg-green-600 rounded-full"
                            style={{ width: '71%' }}
                        />
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Cobros pendientes</Text>
                        <Text className="font-medium text-gray-800">$125,600</Text>
                    </View>

                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <Animated.View
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: '45%' }}
                        />
                    </View>
                </View>
            </Animated.View>
        </ScrollView>
    );
}