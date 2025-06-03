import { Almacen } from '@/core/models/Inventario/Almacen';
import { Articulo } from '@/core/models/Inventario/Articulo';
import { Categoria } from '@/core/models/Inventario/Categoria';
import { Color } from '@/core/models/Inventario/Color';
import { Grupo } from '@/core/models/Inventario/Grupo';
import { Seccion } from '@/core/models/Inventario/Seccion';
import { Talla } from '@/core/models/Inventario/Talla';
import { TipoDeArticulo } from '@/core/models/Inventario/TipoDeArticulo';
import { TipoDeImpuesto } from '@/core/models/Inventario/TipoDeImpuesto';
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
  dataColor: Color[];
  dataTalla: Talla[];
  dataTipoArticulo: TipoDeArticulo[];
  dataTipoImpuesto: TipoDeImpuesto[];
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
          
          {/* Fila final - Ventas, Compras y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
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

            {/* Estado al lado derecho de la misma fila */}
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
          
          {/* Fila final - Estado al final */}
          <View className="flex-row justify-end items-center mb-2">
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
          
          {/* Fila final - Información adicional y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">Categoria: {dataCategory.find(c => c.id === item.codigoCategoria)?.nombre || 'No especificado'}</Text>

            {/* Estado al lado derecho de la misma fila */}
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

const ItemDefault: React.FC<ItemProps> = ({ item, onPress,dataGrupo }) => {
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
          
          {/* Fila final - Estado al final */}
          <View className="flex-row justify-end items-center mb-2">
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

const ItemArticulo: React.FC<{ item: Articulo; onPress: (item: Articulo) => void; dataGrupo: Grupo[]; dataTalla: Talla[];   dataTipoArticulo: TipoDeArticulo[]; dataTipoImpuesto: TipoDeImpuesto[] }> = ({ item, onPress,  dataGrupo, dataTalla, dataTipoArticulo, dataTipoImpuesto }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="p-4">
          <View className="mb-2 flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>{item.nombre}</Text>
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
          
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex">
            <Text className="text-sm text-gray-600">Grupo: {dataGrupo.find(g => g.id === item.codigoGrupo)?.nombre || 'No especificado'}</Text>
            <Text className="text-sm text-gray-600">Talla: {dataTalla.find(g => g.id === item.codigoTalla)?.nombre || 'No especificado'}</Text>
            <Text className="text-sm text-gray-600">Tipo de Artículo: {dataTipoArticulo.find(g => g.id === item.codigoTipoArticulo)?.nombre || 'No especificado'}</Text>
            <Text className="text-sm text-gray-600">Tipo de Impuesto: {dataTipoImpuesto.find(g => g.id === item.codigoImpuesto)?.nombre || 'No especificado'}</Text>
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
          
          {/* Fila final - Información adicional y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">Grupo: {dataGrupo.find(g => g.id === item.codigoGrupo)?.nombre || 'No especificado'}</Text>

            {/* Estado al lado derecho de la misma fila */}
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

export const ItemArticle: React.FC<ItemProps> = ({ item, category, onPress, dataCategory, dataGrupo, dataColor, dataTalla, dataTipoArticulo, dataTipoImpuesto }) => {
  switch (category) {
    case 'almacen':
      return <ItemAlmacen item={item as Almacen} onPress={onPress} />;
    case 'categoria':
      return <ItemCategoria item={item as Categoria} onPress={onPress} />;
    case 'grupo':
      return <ItemGrupo item={item as Grupo} onPress={onPress} dataCategory={dataCategory} />;
    case 'seccion':
      return <ItemSeccion item={item as Seccion} onPress={onPress} dataGrupo={dataGrupo} />;
    case 'articulo':
      return <ItemArticulo item={item as Articulo} onPress={onPress} dataGrupo={dataGrupo} dataTalla={dataTalla} dataTipoArticulo={dataTipoArticulo} dataTipoImpuesto={dataTipoImpuesto} />;
    default:
      return <ItemDefault item={item} category={category} onPress={onPress} dataCategory={dataCategory} dataGrupo={dataGrupo} dataColor={dataColor} dataTalla={dataTalla} dataTipoArticulo={dataTipoArticulo} dataTipoImpuesto={dataTipoImpuesto}/>;
  }
};
