import { Almacen } from "@/core/models/Inventario/Almacen";
import { Articulo } from "@/core/models/Inventario/Articulo";
import { ArticuloListaPrecio } from "@/core/models/Inventario/ArticuloListaPrecio";
import { Categoria } from "@/core/models/Inventario/Categoria";
import { Color } from "@/core/models/Inventario/Color";
import { Grupo } from "@/core/models/Inventario/Grupo";
import { Seccion } from "@/core/models/Inventario/Seccion";
import { Talla } from "@/core/models/Inventario/Talla";
import { TipoDeArticulo } from "@/core/models/Inventario/TipoDeArticulo";
import { TipoDeImpuesto } from "@/core/models/Inventario/TipoDeImpuesto";
import { useArticuloListaDePrecio } from "@/hooks/Inventario/useArticuloListaDePrecio";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type CategoryId =
  | "almacen"
  | "categoria"
  | "articulo"
  | "color"
  | "grupo"
  | "origen"
  | "talla"
  | "tipodearticulo"
  | "tipodeimpuesto"
  | "seccion"
  | "presentacion";

// Función helper para obtener el símbolo de moneda
const getCurrencySymbol = (monedaNombre: string): string => {
  if (!monedaNombre) return '$';
  
  const nombre = monedaNombre.toLowerCase().trim();
  
  // Debug: mostrar el nombre de la moneda para ver qué llega realmente
  console.log('🪙 Nombre de moneda recibido:', `"${monedaNombre}"`);
  
  // Primero verificar si es directamente un símbolo
  if (nombre === '$' || nombre === 'usd' || nombre === 'us$' || nombre === 'dollar') {
    return '$';
  }
  if (nombre === 'bs' || nombre === 'bs.' || nombre === 'bolivar' || nombre === 'vef' || nombre === 'ves') {
    return 'Bs';
  }
  if (nombre === '€' || nombre === 'eur' || nombre === 'euro') {
    return '€';
  }
  
  // Luego buscar patrones dentro del texto
  if (nombre.includes('dólar') || nombre.includes('dolar') || nombre.includes('dollar') || 
      nombre.includes('usd') || nombre.includes('us') || nombre.includes('estados unidos')) {
    return '$';
  } 
  
  if (nombre.includes('bolívar') || nombre.includes('bolivar') || 
      nombre.includes('bs') || nombre.includes('ves') || nombre.includes('vef') ||
      nombre.includes('venezolano') || nombre.includes('venezuela')) {
    return 'Bs';
  } 
  
  if (nombre.includes('euro') || nombre.includes('eur') || nombre.includes('europeo')) {
    return '€';
  }
  
  // Si no se puede identificar, mostrar el nombre tal como viene para debug
  console.warn('⚠️ No se pudo identificar el símbolo para la moneda:', `"${monedaNombre}"`);
  return '$'; // Default
};

// Función helper para obtener el precio más reciente de un artículo
const getLatestPrice = (articuloListaPrecios: ArticuloListaPrecio[], articuloId: number): { price: number, symbol: string } => {
  if (!articuloListaPrecios || !Array.isArray(articuloListaPrecios)) {
    return { price: 0, symbol: '$' };
  }

  // Filtrar precios para este artículo que no estén suspendidos
  const preciosDelArticulo = articuloListaPrecios
    .filter((precio: ArticuloListaPrecio) => 
      precio.idArticulo === articuloId && 
      !precio.suspendido
    );
  
  if (preciosDelArticulo.length === 0) {
    return { price: 0, symbol: '$' };
  }

  // Ordenar por fecha más reciente (fechaDesde)
  const precioMasReciente = preciosDelArticulo
    .sort((a, b) => new Date(b.fechaDesde).getTime() - new Date(a.fechaDesde).getTime())[0];

  // Debug: mostrar los datos del precio más reciente
  console.log('💰 Precio más reciente para artículo', articuloId, ':', {
    monto: precioMasReciente.monto,
    monedaNombre: precioMasReciente.monedaNombre,
    fechaDesde: precioMasReciente.fechaDesde,
    completeObject: precioMasReciente
  });

  const symbol = getCurrencySymbol(precioMasReciente.monedaNombre || '');
  
  return {
    price: precioMasReciente.monto || 0,
    symbol: symbol
  };
};

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
  articuloListaPrecios?: ArticuloListaPrecio[];
}

const ItemAlmacen: React.FC<{
  item: Almacen;
  onPress: (item: Almacen) => void;
}> = ({ item, onPress }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        <View className="p-4">
          <View className="mb-2">
            <Text
              className="text-lg font-semibold text-gray-800"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          {/* Fila final - Ventas, Compras y Estado en la misma fila */}
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row space-x-2">
              <View className="flex-row items-center">
                <View
                  style={{
                    position: "relative",
                    width: 14,
                    height: 14,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {item.aplicaVentas ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons
                        name="checkmark"
                        size={10}
                        color="black"
                        style={{ position: "absolute" }}
                      />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Ventas</Text>
              </View>

              <View className="flex-row items-center">
                <View
                  style={{
                    position: "relative",
                    width: 14,
                    height: 14,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {item.aplicaCompras ? (
                    <>
                      <Ionicons name="ellipse" size={14} color="#00FF15FF" />
                      <Ionicons
                        name="checkmark"
                        size={10}
                        color="black"
                        style={{ position: "absolute" }}
                      />
                    </>
                  ) : (
                    <Ionicons name="close-circle" size={14} color="#7C7D7DFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-800 ml-1">Compras</Text>
              </View>
            </View>

            {/* Estado al lado derecho de la misma fila - Solo mostrar cuando esté inactivo */}
            {item.suspendido && (
              <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
                <Text className="text-xs font-medium text-red-600">
                  Inactivo
                </Text>
              </View>
            )}
          </View>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemCategoria: React.FC<{
  item: Categoria;
  onPress: (item: Categoria) => void;
}> = ({ item, onPress }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text
              className="text-lg font-semibold text-gray-800"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>

          {/* Estado posicionado en la esquina inferior derecha - Solo mostrar cuando esté inactivo */}
          {item.suspendido && (
            <View className="absolute bottom-4 right-4">
              <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
                <Text className="text-xs font-medium text-red-600">
                  Inactivo
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemGrupo: React.FC<{
  item: Grupo;
  onPress: (item: Grupo) => void;
  dataCategory: Categoria[];
}> = ({ item, onPress, dataCategory }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text
              className="text-lg font-semibold text-gray-800"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          {/* Información adicional */}
          <Text className="text-sm text-gray-600 mb-2">
            Categoria:{" "}
            {dataCategory.find((c) => c.id === item.idCategoria)?.nombre ||
              "No especificado"}
          </Text>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>

          {/* Estado posicionado en la esquina inferior derecha - Solo mostrar cuando esté inactivo */}
          {item.suspendido && (
            <View className="absolute bottom-4 right-4">
              <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
                <Text className="text-xs font-medium text-red-600">
                  Inactivo
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemDefault: React.FC<ItemProps> = ({ item, onPress, dataGrupo }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text
              className="text-lg font-semibold text-gray-800"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>

          {/* Estado posicionado en la esquina inferior derecha - Solo mostrar cuando esté inactivo */}
          {item.suspendido && (
            <View className="absolute bottom-4 right-4">
              <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
                <Text className="text-xs font-medium text-red-600">
                  Inactivo
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemArticulo: React.FC<{
  item: Articulo;
  onPress: (item: Articulo) => void;
  dataGrupo: Grupo[];
  dataTalla: Talla[];
  dataTipoArticulo: TipoDeArticulo[];
  dataTipoImpuesto: TipoDeImpuesto[];
  articuloListaPrecios?: ArticuloListaPrecio[]; // Lista opcional pasada desde el componente padre
}> = ({
  item,
  onPress,
  dataGrupo,
  dataTalla,
  dataTipoArticulo,
  dataTipoImpuesto,
  articuloListaPrecios = [],
}) => {
  // Obtener el precio más reciente del artículo
  // Si no se pasa la lista desde el padre, usar el hook (menos eficiente)
  const { useGetArticuloListaDePrecioList } = useArticuloListaDePrecio();
  const { data: articuloListaPreciosData } = useGetArticuloListaDePrecioList(1, 1000);
  
  const preciosData = articuloListaPrecios.length > 0 ? articuloListaPrecios : (articuloListaPreciosData?.data || []);
  const { price, symbol } = getLatestPrice(preciosData, item.id);
  return (
    <View className="bg-white rounded-lg mt-2 shadow-sm border border-gray-200 overflow-hidden">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
        className="flex-row h-32"
      >
        {/* Estado en la esquina superior izquierda - Solo mostrar cuando esté inactivo */}
        {item.suspendido && (
          <View className="absolute top-1 left-1 z-10">
            <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
              <Text className="text-xs font-medium text-red-600">
                Inactivo
              </Text>
            </View>
          </View>
        )}

        {/* Imagen del artículo */}
        <View className="w-32 p-2">
          {item?.fotos?.length > 0 ? (
            <Image
              source={{
                uri: `https://wise.filicabh.com.ve:5000/${item.fotos[0].urlFoto}`,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-full bg-gray-50 items-center justify-center rounded-lg">
              <Ionicons name="cube-outline" size={28} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Contenido Principal */}
        <View className="flex-1 px-2 py-1 justify-between">
          <View>
            {/* Nombre */}
            <Text
              className="text-base font-bold text-gray-800 flex-1 mr-2 mb-1"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>

            {/* Precio y Stock en la misma línea */}
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">Precio: </Text>
              <Text className="text-xs font-semibold text-gray-700 mr-3">
                {price.toFixed(2)} {symbol}
              </Text>
              <Text className="text-xs text-gray-500">Stock: </Text>
              <Text className="text-xs font-semibold text-gray-700">
                {item.stockActual || 0}
              </Text>
            </View>

            {/* Presentación */}
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">Prest: </Text>
              <Text
                className="text-xs font-semibold text-gray-700 flex-1"
                numberOfLines={1}
              >
                {item.presentaciones && item.presentaciones.length > 0 
                  ? `${item.presentaciones.length} configurada(s)`
                  : "Sin presentaciones"}
              </Text>
            </View>
          </View>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5 border-t border-gray-100">
            <Text className="text-[10px] text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-[10px] text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemSeccion: React.FC<{
  item: Seccion;
  onPress: (item: Seccion) => void;
  dataGrupo: Grupo[];
}> = ({ item, onPress, dataGrupo }) => {
  return (
    <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        <View className="p-4 relative min-h-[120px]">
          <View className="mb-2">
            <Text
              className="text-lg font-semibold text-gray-800"
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          {/* Información adicional */}
          <Text className="text-sm text-gray-600 mb-2">
            Grupo:{" "}
            {dataGrupo.find((g) => g.id === item.idGrupo)?.nombre ||
              "No especificado"}
          </Text>

          {/* Información del sistema */}
          <View className="flex-col justify-start items-start pt-0.5">
            <Text className="text-md text-gray-400">
              Creado por: {item.usuarioRegistroNombre} •{" "}
              {new Date(item.fechaRegistro ?? new Date()).toLocaleDateString()}
            </Text>
            <Text className="text-md text-gray-400">
              Últ.Mod:{" "}
              {new Date(
                item.fechaModificacion ?? new Date(),
              ).toLocaleDateString()}
            </Text>
          </View>

          {/* Estado posicionado en la esquina inferior derecha - Solo mostrar cuando esté inactivo */}
          {item.suspendido && (
            <View className="absolute bottom-4 right-4">
              <View className="px-2 py-1 rounded-full bg-red-100 border border-red-600">
                <Text className="text-xs font-medium text-red-600">
                  Inactivo
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const ItemArticle: React.FC<ItemProps> = ({
  item,
  category,
  onPress,
  dataCategory,
  dataGrupo,
  dataColor,
  dataTalla,
  dataTipoArticulo,
  dataTipoImpuesto,
  articuloListaPrecios = [],
}) => {
  switch (category) {
    case "almacen":
      return <ItemAlmacen item={item as Almacen} onPress={onPress} />;
    case "categoria":
      return <ItemCategoria item={item as Categoria} onPress={onPress} />;
    case "grupo":
      return (
        <ItemGrupo
          item={item as Grupo}
          onPress={onPress}
          dataCategory={dataCategory}
        />
      );
    case "seccion":
      return (
        <ItemSeccion
          item={item as Seccion}
          onPress={onPress}
          dataGrupo={dataGrupo}
        />
      );
    case "articulo":
      return (
        <ItemArticulo
          item={item as Articulo}
          onPress={onPress}
          dataGrupo={dataGrupo}
          dataTalla={dataTalla}
          dataTipoArticulo={dataTipoArticulo}
          dataTipoImpuesto={dataTipoImpuesto}
          articuloListaPrecios={articuloListaPrecios}
        />
      );
    default:
      return (
        <ItemDefault
          item={item}
          category={category}
          onPress={onPress}
          dataCategory={dataCategory}
          dataGrupo={dataGrupo}
          dataColor={dataColor}
          dataTalla={dataTalla}
          dataTipoArticulo={dataTipoArticulo}
          dataTipoImpuesto={dataTipoImpuesto}
        />
      );
  }
};
