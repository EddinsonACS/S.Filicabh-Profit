import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import { Ciudad } from '@/core/models/Ventas/Ciudad';
import { FormaDeEntrega } from '@/core/models/Ventas/FormaDeEntrega';
import { ListaDePrecio } from '@/core/models/Ventas/ListaDePrecio';
import { Moneda } from '@/core/models/Ventas/Moneda';
import { Pais } from '@/core/models/Ventas/Pais';
import { Region } from '@/core/models/Ventas/Region';
import { Rubro } from '@/core/models/Ventas/Rubro';
import { Sector } from '@/core/models/Ventas/Sector';
import { TasaDeCambio } from '@/core/models/Ventas/TasaDeCambio';
import { TipoPersona } from '@/core/models/Ventas/TipoPersona';
import { TipoVendedor } from '@/core/models/Ventas/TipoVendedor';
import { Vendedor } from '@/core/models/Ventas/Vendedor';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type CategoryId = 'acuerdodepago' | 'ciudad' | 'region' | 'pais' | 'formadeentrega' | 'tipopersona' | 'tipovendedor' | 'vendedor' | 'moneda' | 'tasadecambio' | 'listadeprecio' | 'sector' | 'rubro';

type ItemUnion = AcuerdoDePago | Ciudad | Region | Pais | FormaDeEntrega | TipoPersona | TipoVendedor | Vendedor | Moneda | TasaDeCambio | ListaDePrecio | Sector | Rubro;

interface ItemArticleProps {
  item: ItemUnion;
  selectedCategory: CategoryId;
  onPress: (item: ItemUnion) => void;
}

const ItemArticle: React.FC<ItemArticleProps> = ({ item, selectedCategory, onPress }) => {
  // Función auxiliar para obtener el nombre de una entidad
  const getEntityName = (item: ItemUnion): string => {
    if ('nombre' in item && item.nombre) {
      return item.nombre;
    }
    if ('codigo' in item && item.codigo) {
      return item.codigo;
    }
    if (selectedCategory === 'tasadecambio') {
      const tasaItem = item as TasaDeCambio;
      return `Tasa ${tasaItem.codigoMoneda} - ${new Date(tasaItem.fecha).toLocaleDateString()}`;
    }
    return `ID: ${item.id}`;
  };

  // Función auxiliar para obtener el estado suspendido
  const getEntitySuspended = (item: ItemUnion): boolean => {
    if ('suspendido' in item) {
      return item.suspendido || false;
    }
    return false; // TasaDeCambio no tiene suspendido, se considera siempre activa
  };

  const entityName = getEntityName(item);
  const isSuspended = getEntitySuspended(item);

  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
              {entityName}
            </Text>
          </View>
          
          {/* Fila final - Información adicional y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            {/* Información adicional a la izquierda */}
            <View className="flex-1 mr-2">
              {selectedCategory === 'acuerdodepago' && (
                <Text className="text-sm text-gray-600">Días: {(item as AcuerdoDePago).dias}</Text>
              )}
              {selectedCategory === 'tasadecambio' && (
                <Text className="text-sm text-gray-600">
                  Venta: {(item as TasaDeCambio).tasaVenta} | Compra: {(item as TasaDeCambio).tasaCompra}
                </Text>
              )}
              {selectedCategory === 'vendedor' && (
                <Text className="text-sm text-gray-600">{(item as Vendedor).email}</Text>
              )}
              {selectedCategory === 'pais' && (
                <Text className="text-sm text-gray-600">Código: {(item as Pais).codigo}</Text>
              )}
              {selectedCategory === 'moneda' && (
                <Text className="text-sm text-gray-600">Código: {(item as Moneda).codigo}</Text>
              )}
            </View>

            {/* Estado a la derecha de la misma fila */}
            {selectedCategory !== 'tasadecambio' ? (
              <View className={`px-2 py-1 rounded-full ${isSuspended
                ? 'bg-red-100 border border-red-600'
                : 'bg-green-100 border border-green-600'
                }`}>
                <Text className={`text-xs font-medium ${isSuspended
                  ? 'text-red-600'
                  : 'text-green-600'
                  }`}>
                  {isSuspended ? 'Inactivo' : 'Activo'}
                </Text>
              </View>
            ) : (
              <View className="px-2 py-1 rounded-full bg-blue-100 border border-blue-600">
                <Text className="text-xs font-medium text-blue-600">
                  {new Date((item as TasaDeCambio).fecha).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Información del sistema al final */}
          <Text className="text-xs text-gray-400 mt-2">
            ID: {item.id} · Creado: {item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString() : 'N/A'}
          </Text>
          {item.usuarioRegistroNombre && (
            <Text className="text-xs text-gray-400">
              Creado por: {item.usuarioRegistroNombre}
            </Text>
          )}
          {item.fechaModificacion && (
            <Text className="text-xs text-gray-400">
              Última modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ItemArticle; 