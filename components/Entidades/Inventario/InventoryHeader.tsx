import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface InventoryHeaderProps {
  viewType: 'chips' | 'dropdown';
  setViewType: (type: 'chips' | 'dropdown') => void;
  navigateToModules: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  viewType,
  setViewType,
  navigateToModules
}) => {
  return (
    <View className="bg-purple-900 px-4 py-4">
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
              color="#f3e8ff"
            />
          </TouchableOpacity>

          <View>
            <Text className="text-white text-xl font-bold">Inventario</Text>
            <Text className="text-purple-200 text-sm">Gestión de inventario en Profit Plus</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-purple-800 rounded-full p-2 flex-row items-center"
          onPress={() => setViewType(viewType === 'chips' ? 'dropdown' : 'chips')}
        >
          <Ionicons
            name={viewType === 'chips' ? 'list-outline' : 'grid-outline'}
            size={18}
            color="#f3e8ff"
          />
          <Text className="text-purple-100 ml-1 text-xs">
            {viewType === 'chips' ? 'Ver lista' : 'Ver chips'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InventoryHeader;
