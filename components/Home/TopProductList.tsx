import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, TrendingUp, ChevronRight, Award } from 'lucide-react-native';
import { PeriodType } from '../../app/(views)/(Home)/Home';

interface TopProductListProps {
  period: PeriodType;
}

interface Product {
  id: string;
  name: string;
  units: number;
  revenue: number;
  change: number;
}

const TopProductList: React.FC<TopProductListProps> = ({ period }) => {
  // Datos simulados - varían según el período seleccionado
  const getProductsData = (): Product[] => {
    switch (period) {
      case 'month':
        return [
          { id: '1', name: 'Producto A', units: 145, revenue: 48500, change: 12.5 },
          { id: '2', name: 'Producto B', units: 128, revenue: 42800, change: 8.3 },
          { id: '3', name: 'Producto C', units: 96, revenue: 32500, change: -4.2 },
          { id: '4', name: 'Producto D', units: 87, revenue: 29600, change: 5.7 },
          { id: '5', name: 'Producto E', units: 72, revenue: 25400, change: 9.1 },
        ];
      case 'year':
        return [
          { id: '1', name: 'Producto A', units: 1245, revenue: 415000, change: 18.5 },
          { id: '2', name: 'Producto F', units: 987, revenue: 329000, change: 22.3 },
          { id: '3', name: 'Producto B', units: 876, revenue: 292000, change: 7.8 },
          { id: '4', name: 'Producto G', units: 756, revenue: 252000, change: -2.1 },
          { id: '5', name: 'Producto C', units: 698, revenue: 232500, change: 5.9 },
        ];
      case 'custom':
        return [
          { id: '1', name: 'Producto D', units: 62, revenue: 20700, change: 15.2 },
          { id: '2', name: 'Producto A', units: 54, revenue: 18000, change: 9.8 },
          { id: '3', name: 'Producto H', units: 48, revenue: 16000, change: -1.5 },
          { id: '4', name: 'Producto B', units: 45, revenue: 15000, change: 3.7 },
          { id: '5', name: 'Producto I', units: 39, revenue: 13000, change: 6.2 },
        ];
      default: // 'week'
        return [
          { id: '1', name: 'Producto A', units: 45, revenue: 15000, change: 8.5 },
          { id: '2', name: 'Producto B', units: 34, revenue: 12800, change: 4.3 },
          { id: '3', name: 'Producto C', units: 28, revenue: 9500, change: -2.1 },
          { id: '4', name: 'Producto D', units: 22, revenue: 7600, change: 1.7 },
          { id: '5', name: 'Producto E', units: 18, revenue: 5400, change: 3.2 },
        ];
    }
  };

  const topProducts = getProductsData();

  // Formato para los valores monetarios
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-20 shadow-lg">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <Award size={20} color="#1e3a8a" />
          </View>
          <Text className="text-lg font-semibold">Top productos más vendidos</Text>
        </View>
        <TouchableOpacity className="bg-blue-50 p-2 rounded-full">
          <ChevronRight size={18} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      {topProducts.map((product, index) => (
        <TouchableOpacity
          key={product.id}
          className={`flex-row items-center p-3 rounded-xl mb-2 ${index === 0 ? 'bg-blue-50' : 'bg-gray-50'
            }`}
        >
          {/* Ranking o posición */}
          <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${index === 0 ? 'bg-blue-200' : 'bg-gray-200'
            }`}>
            <Text className={`font-bold ${index === 0 ? 'text-blue-800' : 'text-gray-800'
              }`}>{index + 1}</Text>
          </View>

          {/* Información del producto */}
          <View className="flex-1">
            <Text className="font-semibold">{product.name}</Text>
            <View className="flex-row mt-1">
              <Text className="text-xs text-gray-500 mr-4">
                <ShoppingBag size={12} color="#666" /> {product.units} unidades
              </Text>
              <View className="flex-row items-center">
                <TrendingUp size={12} color={product.change >= 0 ? '#4CAF50' : '#F44336'} />
                <Text className={`text-xs ml-1 ${product.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {product.change > 0 ? '+' : ''}{product.change}%
                </Text>
              </View>
            </View>
          </View>

          {/* Ingresos */}
          <Text className="font-bold">{formatCurrency(product.revenue)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TopProductList;