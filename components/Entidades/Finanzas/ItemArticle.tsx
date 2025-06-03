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
        return `Moneda: ${dataMoneda.find(m => m.id === item.codigoMoneda)?.nombre || 'N/A'}`;
      case 'cuentaBancaria':
        return `Banco: ${dataBanco.find(b => b.id === item.codigoBanco)?.nombre || 'N/A'}`;
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
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
              {category === 'cuentaBancaria' ? item.nroCuenta : item.nombre}
            </Text>
          </View>
          
          {/* Fila final - Información adicional y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            {subtitle && (
              <View className="flex-1 mr-2">
                <Text className="text-sm text-gray-600">{subtitle}</Text>
              </View>
            )}

            {/* Estado a la derecha de la misma fila */}
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

          {/* Información del sistema al final */}
          <Text className="text-xs text-gray-400 mt-2">
            ID: {item.id} · Creado: {new Date(item.fechaRegistro).toLocaleDateString()}
          </Text>
          <Text className="text-xs text-gray-400">
            Creado por: {item.usuarioRegistroNombre}
          </Text>
          <Text className="text-xs text-gray-400">
            Ultima modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ItemArticle; 