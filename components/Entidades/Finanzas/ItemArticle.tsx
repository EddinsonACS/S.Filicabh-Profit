import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { themes } from '../shared/theme';

interface ItemArticleProps {
  item: any;
  category: 'banco' | 'caja' | 'cuentaBancaria';
  onPress: (item: any) => void;
}

const ItemArticle: React.FC<ItemArticleProps> = ({ item, category, onPress }) => {
  const getIcon = () => {
    switch (category) {
      case 'banco':
        return 'business';
      case 'caja':
        return 'cash';
      case 'cuentaBancaria':
        return 'card';
      default:
        return 'document-text';
    }
  };

  const getTitle = () => {
    switch (category) {
      case 'banco':
      case 'caja':
        return item.nombre;
      case 'cuentaBancaria':
        return item.nroCuenta;
      default:
        return '';
    }
  };

  const getSubtitle = () => {
    switch (category) {
      case 'banco':
        return `Código: ${item.codigo || 'N/A'}`;
      case 'caja':
        return `Moneda: ${item.codigoMoneda || 'N/A'}`;
      case 'cuentaBancaria':
        return `Banco: ${item.codigoBanco || 'N/A'}`;
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="bg-white mb-2 rounded-lg shadow-sm border border-gray-200"
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${themes.finanzas.buttonColor}20` }}
            >
              <Ionicons
                name={getIcon()}
                size={20}
                color={themes.finanzas.buttonColor}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium text-base">
                {getTitle()}
              </Text>
              <Text className="text-gray-500 text-sm">
                {getSubtitle()}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View
              className={`px-2 py-1 rounded-full ${
                item.suspendido ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.suspendido ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {item.suspendido ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9CA3AF"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemArticle; 