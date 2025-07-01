import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import { Ciudad } from '@/core/models/Ventas/Ciudad';
import { FiguraComercial } from '@/core/models/Ventas/FiguraComercial';
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

type CategoryId = 'acuerdodepago' | 'ciudad' | 'region' | 'pais' | 'formadeentrega' | 'tipopersona' | 'tipovendedor' | 'vendedor' | 'moneda' | 'tasadecambio' | 'listadeprecio' | 'sector' | 'rubro' | 'figuracomercial';

type ItemUnion = AcuerdoDePago | Ciudad | Region | Pais | FormaDeEntrega | TipoPersona | TipoVendedor | Vendedor | Moneda | TasaDeCambio | ListaDePrecio | Sector | Rubro | FiguraComercial;

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
      return `Tasa ${tasaItem.idMoneda} - ${new Date(tasaItem.fecha).toLocaleDateString()}`;
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

  // Función auxiliar para obtener información adicional del item
  const getAdditionalInfo = (item: ItemUnion, category: CategoryId): string[] => {
    const info: string[] = [];

    switch (category) {
      case 'acuerdodepago':
        info.push(`Días: ${(item as AcuerdoDePago).dias}`);
        break;
      case 'tasadecambio':
        const tasa = item as TasaDeCambio;
        info.push(`Venta: ${tasa.tasaVenta} | Compra: ${tasa.tasaCompra}`);
        break;
      case 'vendedor':
        info.push((item as Vendedor).email);
        break;
      case 'pais':
        info.push(`Código: ${(item as Pais).codigo}`);
        break;
      case 'moneda':
        info.push(`Código: ${(item as Moneda).codigo}`);
        break;
      case 'figuracomercial':
        const figura = item as FiguraComercial;
        info.push(`RIF: ${figura.rif}`);
        info.push(`NIT: ${figura.nit}`);
        info.push(`Contacto: ${figura.personaContacto}`);
        info.push(`Tel: ${figura.telefono}`);
        info.push(`Email: ${figura.email}`);
        if (figura.emailAlterno) {
          info.push(`Email Alt: ${figura.emailAlterno}`);
        }
        break;
    }

    return info;
  };

  const entityName = getEntityName(item);
  const isSuspended = getEntitySuspended(item);
  const additionalInfo = getAdditionalInfo(item, selectedCategory);

  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
              {entityName}
            </Text>
          </View>

          {/* Información adicional */}
          {additionalInfo.length > 0 && (
            <View className="flex mr-2">
              {additionalInfo.map((info, index) => (
                <Text key={index} className="text-sm text-gray-600">{info}</Text>
              ))}
            </View>
          )}

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            {item.usuarioRegistroNombre && (
              <Text className="text-md text-gray-400">
                Creado por: {item.usuarioRegistroNombre} • {item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString() : 'N/A'}
              </Text>
            )}
            {item.fechaModificacion && (
              <Text className="text-md text-gray-400">
                Últ.Mod: {new Date(item.fechaModificacion).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Estado posicionado en la esquina inferior derecha */}
          <View className="absolute bottom-4 right-4">
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
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ItemArticle; 