import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface VentasHeaderProps {
    viewType: 'chips' | 'dropdown';
    setViewType: (type: 'chips' | 'dropdown') => void;
    navigateToModules: () => void;
}

const VentasHeader: React.FC<VentasHeaderProps> = ({
    viewType,
    setViewType,
    navigateToModules
}) => {
    return (
        <View className="bg-green-900 px-4 py-4">
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    {/* Botón de flecha para volver a módulos/favoritos */}
                    <TouchableOpacity
                        className="mr-3 p-1"
                        onPress={navigateToModules}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#dcfce7"
                        />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-xl font-bold">Ventas y Compras</Text>
                        <Text className="text-green-200 text-sm">Gestión comercial en Profit Plus</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-green-800 rounded-full p-2 flex-row items-center"
                    onPress={() => setViewType(viewType === 'chips' ? 'dropdown' : 'chips')}
                >
                    <Ionicons
                        name={viewType === 'chips' ? 'list-outline' : 'grid-outline'}
                        size={18}
                        color="#dcfce7"
                    />
                    <Text className="text-green-100 ml-1 text-xs">
                        {viewType === 'chips' ? 'Ver lista' : 'Ver chips'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default VentasHeader;