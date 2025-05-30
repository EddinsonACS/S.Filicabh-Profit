import { Almacen } from '@/core/models/Inventario/Almacen';
import { Categoria } from '@/core/models/Inventario/Categoria';
import { Grupo } from '@/core/models/Inventario/Grupo';
import { Seccion } from '@/core/models/Inventario/Seccion';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type CategoryId = 'almacen' | 'categoria' | 'articulo' | 'color' | 'grupo' | 'origen' | 'talla' | 'tipodearticulo' | 'tipodeimpuesto' | 'seccion' | 'unidad';

interface BaseItem {
  id: number;
  nombre: string;
  suspendido: boolean;
  fechaRegistro: string;
  usuarioRegistroNombre: string;
  fechaModificacion: string;
  usuarioModificacionNombre: string;
}

interface ItemProps {
  item: BaseItem;
  category: CategoryId;
  onPress: (item: any) => void;
  dataCategory: Categoria[];
  dataGrupo: Grupo[];
}

const ItemAlmacen: React.FC<{ item: Almacen; onPress: (item: Almacen) => void }> = ({ item, onPress }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row space-x-2">
              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaVentas ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Ventas</Text>
              </View>

              <View className="flex-row items-center">
                <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {item.aplicaCompras ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons name="checkmark" size={10} color="black" style={{ position: 'absolute' }} />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Compras</Text>
              </View>
            </View>

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

const ItemCategoria: React.FC<{ item: Categoria; onPress: (item: Categoria) => void }> = ({ item, onPress }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">

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

const ItemGrupo: React.FC<{ item: Grupo; onPress: (item: Grupo) => void; dataCategory: Categoria[] }> = ({ item, onPress, dataCategory }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">Categoria: {dataCategory.find(c => c.id === item.codigoCategoria)?.nombre || 'No especificado'}</Text>
            </View>

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

const ItemDefault: React.FC<ItemProps> = ({ item, category, onPress, dataCategory, dataGrupo }) => {
  const getIcon = () => {
    switch (category) {
      case 'articulo':
        return 'cube';
      case 'color':
        return 'color-palette';
      case 'origen':
        return 'globe';
      case 'talla':
        return 'resize';
      case 'tipodearticulo':
        return 'pricetag';
      case 'tipodeimpuesto':
        return 'calculator';
      case 'unidad':
        return 'scale';
      default:
        return 'document-text';
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
              style={{ backgroundColor: '#E5E7EB' }}
            >
              <Ionicons
                name={getIcon()}
                size={20}
                color="#374151"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium text-base">
                {item.nombre}
              </Text>
              <Text className="text-gray-500 text-sm">
                ID: {item.id} · Creado: {new Date(item.fechaRegistro).toLocaleDateString()}
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

const ItemSeccion: React.FC<{ item: Seccion; onPress: (item: Seccion) => void; dataGrupo: Grupo[] }> = ({ item, onPress,  dataGrupo }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">Grupo: {dataGrupo.find(g => g.id === item.codigoGrupo)?.nombre || 'No especificado'}</Text>
            </View>

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

export const ItemArticle: React.FC<ItemProps> = ({ item, category, onPress, dataCategory, dataGrupo }) => {
  switch (category) {
    case 'almacen':
      return <ItemAlmacen item={item as Almacen} onPress={onPress} />;
    case 'categoria':
      return <ItemCategoria item={item as Categoria} onPress={onPress} />;
    case 'grupo':
      return <ItemGrupo item={item as Grupo} onPress={onPress} dataCategory={dataCategory} />;
    case 'seccion':
      return <ItemSeccion item={item as Seccion} onPress={onPress} dataGrupo={dataGrupo} />;
    default:
      return <ItemDefault item={item} category={category} onPress={onPress} dataCategory={dataCategory} dataGrupo={dataGrupo}/>;
  }
};
