import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../../components/LoadingScreen';
import { getCurrentSectionColor } from '../../../utils/colorManager';

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
        color: '#007C2DFF',
        bgColor: '#dcfce7',
        route: '/Ventas/AgentesComerciales'
    },
    {
        id: 'orders',
        title: 'Pedidos',
        description: 'Crea y administra pedidos de clientes',
        icon: 'cart-outline',
        color: '#007C2DFF',
        bgColor: '#dcfce7',
        route: '/Ventas/Pedidos'
    },
    {
        id: 'payments',
        title: 'Cobros',
        description: 'Gestiona pagos y estado de cuenta',
        icon: 'cash-outline',
        color: '#007C2DFF',
        bgColor: '#dcfce7',
        route: '/Ventas/Cobros'
    },
    {
        id: 'retentions',
        title: 'Retenciones',
        description: 'Administra retenciones de impuestos',
        icon: 'document-text-outline',
        color: '#007C2DFF',
        bgColor: '#dcfce7',
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
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [viewType, setViewType] = useState<ViewType>(ViewType.Grid);

    // Obtener el color de la sección actual
    const sectionColor = getCurrentSectionColor(pathname);

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
        return <LoadingScreen message="Cargando Modulo Ventas" color="green" />;
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
            {/* Cabecera */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="pt-4 pb-5 px-4"
                style={{ backgroundColor: sectionColor }}
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-white text-2xl font-bold">Ventas</Text>

                    <View className="flex-row">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full items-center justify-center mr-2"
                            style={{ backgroundColor: `${sectionColor}CC` }}
                            onPress={toggleViewType}
                        >
                            <Ionicons
                                name={viewType === ViewType.Grid ? 'list-outline' : 'grid-outline'}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Resumen */}
                <View className="flex-row mt-5 justify-between">
                    <View 
                        className="rounded-xl p-3" 
                        style={{ width: '48%', backgroundColor: `${sectionColor}CC` }}
                    >
                        <Text className="text-white text-sm opacity-80">Ventas del mes</Text>
                        <Text className="text-white text-xl font-bold">$430,500</Text>
                    </View>

                    <View 
                        className="rounded-xl p-3" 
                        style={{ width: '48%', backgroundColor: `${sectionColor}CC` }}
                    >
                        <Text className="text-white text-sm opacity-80">Pedidos pendientes</Text>
                        <Text className="text-white text-xl font-bold">12</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Menú principal */}
            <Animated.View
                entering={SlideInUp.duration(400).delay(300)}
                className="px-4 py-3"
            >
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-800 font-medium">Módulos de ventas</Text>
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
                                <View style={{ backgroundColor: option.bgColor }} className="w-12 h-12 rounded-full items-center justify-center mr-4">
                                    <Ionicons name={option.icon} size={24} color={option.color} />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-800 font-semibold mb-1">{option.title}</Text>
                                    <Text className="text-gray-600 text-sm">{option.description}</Text>
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
                className="px-4 py-3 mb-6"
            >
                <Text className="text-gray-800 font-medium mb-3">Estadísticas rápidas</Text>

                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-gray-800">Desempeño mensual</Text>
                        <TouchableOpacity>
                            <Text className="text-gray-800">Ver más</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Nuevos agentes comerciales</Text>
                        <Text className="font-medium text-gray-800">15</Text>
                    </View>

                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <Animated.View
                            className="h-full bg-gray-800 rounded-full"
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