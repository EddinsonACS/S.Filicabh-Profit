import { Banco } from '@/core/models/Finanzas/Banco';
import { Moneda } from '@/core/models/Ventas/Moneda';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ItemArticleProps {
  item: any;
  category: 'banco' | 'caja' | 'cuentaBancaria';
  onPress: (item: any) => void;
  dataMoneda: Moneda[];
  dataBanco: Banco[];
}

const ItemArticle: React.FC<ItemArticleProps> = ({ item, category, onPress, dataMoneda, dataBanco }) => {
  const getSubtitle = () => {
    switch (category) {
      case 'banco':
        return '';
      case 'caja':
        return `Moneda: ${dataMoneda.find(m => m.id === item.idMoneda)?.nombre || 'N/A'}`;
      case 'cuentaBancaria':
        return `Banco: ${dataBanco.find(b => b.id === item.idBanco)?.nombre || 'N/A'}`;
      default:
        return '';
    }
  };

  const subtitle = getSubtitle();

  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
              {category === 'cuentaBancaria' ? item.nroCuenta : item.nombre}
            </Text>
          </View>

          {/* Información adicional */}
          {subtitle && (
            <View className="flex-1 mr-2">
              <Text className="text-sm text-gray-600">{subtitle}</Text>
            </View>
          )}

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} • {new Date(item.fechaRegistro).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod: {new Date(item.fechaModificacion).toLocaleDateString()}
            </Text>
          </View>

          {/* Estado posicionado en la esquina inferior derecha */}
          <View className="absolute bottom-4 right-4">
            <View className={`px-2 py-1 rounded-full ${item.suspendido
              ? 'bg-red-100 border border-red-600'
              : 'bg-green-100 border border-green-600'
              }`}>
              <Text className={`text-xs font-medium ${item.suspendido
                ? 'text-red-600'
                : 'text-green-600'
                }`}>
                {item.suspendido ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ItemArticle;